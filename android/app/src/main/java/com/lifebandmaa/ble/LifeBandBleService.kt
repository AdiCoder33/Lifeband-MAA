package com.lifebandmaa.ble

import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleService
import com.lifebandmaa.R

class LifeBandBleService : LifecycleService(), LifeBandBleManager.Callback {

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothScanner: BluetoothLeScanner? = null
    private var scanCallback: ScanCallback? = null
    private var currentDevice: BluetoothDevice? = null
    private var manager: LifeBandBleManager? = null
    private var currentOptions: BleStartOptions? = null

    override fun onCreate() {
        super.onCreate()
        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothAdapter = bluetoothManager.adapter
        bluetoothScanner = bluetoothAdapter?.bluetoothLeScanner
        manager = LifeBandBleManager(this, this)
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification("Idle", "Waiting for command"))
    }

    override fun onBind(intent: Intent): IBinder? {
        super.onBind(intent)
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> handleStart(intent)
            ACTION_STOP -> handleStop()
            ACTION_UPDATE_PATIENT -> {
                LifeBandBleState.patientId = intent.getStringExtra(EXTRA_PATIENT_ID)
            }
            ACTION_UPDATE_ENDPOINT -> {
                LifeBandBleState.uploadEndpoint = intent.getStringExtra(EXTRA_UPLOAD_ENDPOINT)
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        stopScanning()
        disconnect()
        super.onDestroy()
    }

    private fun handleStart(intent: Intent) {
        currentOptions = BleStartOptions(
            deviceId = intent.getStringExtra(EXTRA_DEVICE_ID),
            macAddress = intent.getStringExtra(EXTRA_MAC_ADDRESS),
            deviceNamePrefix = intent.getStringExtra(EXTRA_DEVICE_PREFIX)
        ).also { LifeBandBleState.startOptions = it }

        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            LifeBandBleEventEmitter.sendError("Bluetooth adapter unavailable or disabled")
            stopSelfSafely()
            return
        }

        val targetDeviceId = currentOptions?.deviceId ?: currentOptions?.macAddress
        if (!targetDeviceId.isNullOrBlank()) {
            val remoteDevice = kotlin.runCatching { adapter.getRemoteDevice(targetDeviceId) }.getOrNull()
            if (remoteDevice != null) {
                connectTo(remoteDevice)
            } else {
                LifeBandBleEventEmitter.sendError("Unable to resolve device $targetDeviceId")
            }
            return
        }

        startScanning(currentOptions)
    }

    private fun handleStop() {
        LifeBandBleEventEmitter.sendStatus("disconnecting", "Stopping LifeBand connection")
        stopScanning()
        disconnect()
        LifeBandBleState.reset()
        LifeBandBleEventEmitter.sendStatus("disconnected", "LifeBand connection stopped")
        stopForeground(STOP_FOREGROUND_DETACH)
        stopSelfSafely()
    }

    private fun stopSelfSafely() {
        runCatching { stopForeground(STOP_FOREGROUND_REMOVE) }
        stopSelf()
    }

    @SuppressLint("MissingPermission")
    private fun startScanning(options: BleStartOptions?) {
        stopScanning()
        if (!hasScanPermission()) {
            LifeBandBleEventEmitter.sendError("Bluetooth scan permission denied")
            return
        }
        LifeBandBleEventEmitter.sendStatus("scanning", "Scanning for LifeBand devices")
        updateNotification("Scanning", "Looking for LifeBand wearable")

        val scanner = bluetoothScanner ?: bluetoothAdapter?.bluetoothLeScanner
        if (scanner == null) {
            LifeBandBleEventEmitter.sendError("Bluetooth scanner unavailable")
            return
        }

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        val callback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val device = result.device ?: return
                if (!matches(device, result, options)) return

                LifeBandBleEventEmitter.sendDevice(
                    event = "DISCOVERED",
                    deviceId = device.address,
                    deviceName = device.name,
                    rssi = result.rssi
                )
                stopScanning()
                connectTo(device)
            }

            override fun onScanFailed(errorCode: Int) {
                LifeBandBleEventEmitter.sendError("Scan failed with error $errorCode")
                updateNotification("Error", "Scan failed ($errorCode)")
            }
        }

        scanCallback = callback
        scanner.startScan(null, settings, callback)
    }

    private fun matches(device: BluetoothDevice, result: ScanResult, options: BleStartOptions?): Boolean {
        options ?: return false

        val address = device.address?.lowercase()
        val name = device.name?.lowercase()

        options.deviceId?.let {
            if (address == it.lowercase()) {
                return true
            }
        }

        options.macAddress?.let {
            if (address == it.lowercase()) {
                return true
            }
        }

        val prefix = (options.deviceNamePrefix ?: DEFAULT_DEVICE_PREFIX).lowercase()
        return prefix.isNotBlank() && name?.startsWith(prefix) == true
    }

    @SuppressLint("MissingPermission")
    private fun connectTo(device: BluetoothDevice) {
        if (!hasConnectPermission()) {
            LifeBandBleEventEmitter.sendError("Bluetooth connect permission denied")
            return
        }
        currentDevice = device
        LifeBandBleEventEmitter.sendStatus("connecting", "Connecting to ${device.name ?: device.address}")
        updateNotification("Connecting", "Connecting to ${device.name ?: device.address}")

        manager?.connect(device)
            ?.useAutoConnect(false)
            ?.retry(2, 100)
            ?.timeout(20000)
            ?.enqueue()
    }

    @SuppressLint("MissingPermission")
    private fun disconnect() {
        currentDevice?.let {
            LifeBandBleEventEmitter.sendDevice("DISCONNECTED", it.address, it.name, null)
        }
        currentDevice = null
        if (hasConnectPermission()) {
            manager?.disconnect()?.enqueue()
        }
    }

    @SuppressLint("MissingPermission")
    private fun stopScanning() {
        val callback = scanCallback
        val scanner = bluetoothScanner ?: bluetoothAdapter?.bluetoothLeScanner
        if (callback != null && scanner != null && hasScanPermission()) {
            scanner.stopScan(callback)
        }
        scanCallback = null
    }

    private fun updateNotification(title: String, message: String) {
        val notification = buildNotification(title, message)
        NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, notification)
    }

    private fun buildNotification(title: String, message: String): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            ?.apply { addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP) }
            ?: Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or pendingIntentImmutableFlag()
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "LifeBand BLE",
                NotificationManager.IMPORTANCE_LOW
            )
            channel.description = "Foreground service for LifeBand BLE streaming"
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun pendingIntentImmutableFlag(): Int =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0

    private fun hasScanPermission(): Boolean =
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            true
        } else {
            checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED
        }

    private fun hasConnectPermission(): Boolean =
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            true
        } else {
            checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
        }

    override fun onReady(deviceName: String?) {
        LifeBandBleEventEmitter.sendStatus("connected", "Connected to ${deviceName ?: "LifeBand"}")
        currentDevice?.let {
            LifeBandBleEventEmitter.sendDevice("CONNECTED", it.address, it.name, null)
        }
        updateNotification("Connected", "Receiving data from ${deviceName ?: "LifeBand"}")
    }

    override fun onServicesInvalid() {
        LifeBandBleEventEmitter.sendStatus("disconnected", "Service invalidated")
        currentDevice?.let {
            LifeBandBleEventEmitter.sendDevice("DISCONNECTED", it.address, it.name, null)
        }
        updateNotification("Disconnected", "Service invalidated")
        restartScanWithBackoff()
    }

    override fun onReading(reading: LifeBandReading) {
        LifeBandBleEventEmitter.sendReading(reading)
        maybeUploadReading(reading)
    }

    override fun onError(message: String) {
        LifeBandBleEventEmitter.sendError(message)
        LifeBandBleEventEmitter.sendStatus("error", message)
        updateNotification("Error", message)
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        super.onTaskRemoved(rootIntent)
        handleStop()
    }

    private fun restartScanWithBackoff() {
        currentDevice = null
        if (LifeBandBleState.startOptions != null) {
            ContextCompat.getMainExecutor(this).execute {
                startScanning(LifeBandBleState.startOptions)
            }
        }
    }

    private fun maybeUploadReading(reading: LifeBandReading) {
        val endpoint = LifeBandBleState.uploadEndpoint ?: return
        Log.d(TAG, "Upload placeholder to $endpoint for reading ${reading.timestamp}")
        // Networking will be implemented in a later phase once the ingestion API is ready.
    }

    companion object {
        private const val TAG = "LifeBandBleService"
        private const val DEFAULT_DEVICE_PREFIX = "lifeband"
        private const val NOTIFICATION_CHANNEL_ID = "lifeband_ble_channel"
        private const val NOTIFICATION_ID = 101

        const val ACTION_START = "com.lifebandmaa.ble.ACTION_START"
        const val ACTION_STOP = "com.lifebandmaa.ble.ACTION_STOP"
        const val ACTION_UPDATE_PATIENT = "com.lifebandmaa.ble.ACTION_UPDATE_PATIENT"
        const val ACTION_UPDATE_ENDPOINT = "com.lifebandmaa.ble.ACTION_UPDATE_ENDPOINT"

        const val EXTRA_DEVICE_ID = "extra_device_id"
        const val EXTRA_MAC_ADDRESS = "extra_mac_address"
        const val EXTRA_DEVICE_PREFIX = "extra_device_prefix"
        const val EXTRA_PATIENT_ID = "extra_patient_id"
        const val EXTRA_UPLOAD_ENDPOINT = "extra_upload_endpoint"

        fun startService(context: Context, options: BleStartOptions?) {
            val intent = Intent(context, LifeBandBleService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_DEVICE_ID, options?.deviceId)
                putExtra(EXTRA_MAC_ADDRESS, options?.macAddress)
                putExtra(EXTRA_DEVICE_PREFIX, options?.deviceNamePrefix)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        fun stopService(context: Context) {
            val intent = Intent(context, LifeBandBleService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }

        fun updatePatient(context: Context, patientId: String?) {
            val intent = Intent(context, LifeBandBleService::class.java).apply {
                action = ACTION_UPDATE_PATIENT
                putExtra(EXTRA_PATIENT_ID, patientId)
            }
            context.startService(intent)
        }

        fun updateEndpoint(context: Context, endpoint: String?) {
            val intent = Intent(context, LifeBandBleService::class.java).apply {
                action = ACTION_UPDATE_ENDPOINT
                putExtra(EXTRA_UPLOAD_ENDPOINT, endpoint)
            }
            context.startService(intent)
        }
    }
}
