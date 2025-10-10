package com.lifebandmaa.ble

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.LifecycleEventListener

class LifeBandBleModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context), LifecycleEventListener {

    init {
        LifeBandBleEventEmitter.initialize(context)
        context.addLifecycleEventListener(this)
    }

    override fun getName(): String = "LifeBandBleModule"

    override fun initialize() {
        super.initialize()
        LifeBandBleEventEmitter.initialize(context)
    }

    @ReactMethod
    fun startBle(options: ReadableMap?, promise: Promise) {
        val startOptions = parseOptions(options)
        LifeBandBleState.startOptions = startOptions

        if (!hasRequiredPermissions()) {
            val message = "Missing Bluetooth permissions for scanning or connecting"
            LifeBandBleEventEmitter.sendError(message)
            promise.reject("PERMISSION_DENIED", message)
            return
        }

        ensureBatteryOptimizationExemption()
        LifeBandBleService.startService(context, startOptions)
        promise.resolve(null)
    }

    @ReactMethod
    fun stopBle(promise: Promise) {
        LifeBandBleService.stopService(context)
        LifeBandBleState.reset()
        LifeBandBleEventEmitter.sendStatus("idle", "LifeBand BLE stopped")
        promise.resolve(null)
    }

    @ReactMethod
    fun setPatientId(patientId: String) {
        LifeBandBleState.patientId = patientId
        LifeBandBleService.updatePatient(context, patientId)
    }

    @ReactMethod
    fun setUploadEndpoint(endpoint: String) {
        LifeBandBleState.uploadEndpoint = endpoint
        LifeBandBleService.updateEndpoint(context, endpoint)
    }

    private fun parseOptions(options: ReadableMap?): BleStartOptions {
        if (options == null) {
            return BleStartOptions(deviceNamePrefix = DEFAULT_DEVICE_PREFIX)
        }

        fun ReadableMap.optString(key: String): String? =
            if (hasKey(key) && !isNull(key)) getString(key) else null

        val prefix = options.optString("deviceNamePrefix") ?: DEFAULT_DEVICE_PREFIX
        return BleStartOptions(
            deviceId = options.optString("deviceId"),
            macAddress = options.optString("macAddress"),
            deviceNamePrefix = prefix
        )
    }

    private fun hasRequiredPermissions(): Boolean {
        val hasScan = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            true
        } else {
            ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED
        }

        val hasConnect = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            true
        } else {
            ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
        }

        val hasLocation = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            true
        } else {
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        }

        return hasScan && hasConnect && hasLocation
    }

    private fun ensureBatteryOptimizationExemption() {
        val pm = context.getSystemService(PowerManager::class.java) ?: return
        if (pm.isIgnoringBatteryOptimizations(context.packageName)) {
            return
        }

        val intent = IntentBuilder.ignoreBatteryOptimizations(context.packageName)
        intent?.let {
            it.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            runCatching { context.startActivity(it) }
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        context.removeLifecycleEventListener(this)
        LifeBandBleService.stopService(context)
    }

    override fun onHostResume() {}

    override fun onHostPause() {}

    override fun onHostDestroy() {
        LifeBandBleService.stopService(context)
    }

    private object IntentBuilder {
        fun ignoreBatteryOptimizations(packageName: String): android.content.Intent? {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                android.content.Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                }
            } else {
                null
            }
        }
    }

    companion object {
        private const val DEFAULT_DEVICE_PREFIX = "LIFEBAND"
    }
}
