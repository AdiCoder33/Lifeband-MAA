package com.lifebandmaa.ble

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import android.content.Context
import no.nordicsemi.android.ble.BleManager
import no.nordicsemi.android.ble.callback.DataReceivedCallback
import no.nordicsemi.android.ble.data.Data
import org.json.JSONException
import org.json.JSONObject
import java.nio.charset.StandardCharsets
import java.util.UUID

class LifeBandBleManager(
    context: Context,
    private val callback: Callback
) : BleManager(context) {

    interface Callback {
        fun onReady(deviceName: String?)
        fun onServicesInvalid()
        fun onReading(reading: LifeBandReading)
        fun onError(message: String)
    }

    private var streamCharacteristic: BluetoothGattCharacteristic? = null

    override fun getGattCallback(): BleManagerGattCallback = ManagerGattCallback()

    private inner class ManagerGattCallback : BleManagerGattCallback() {
        override fun isRequiredServiceSupported(gatt: BluetoothGatt): Boolean {
            val service = gatt.getService(LIFEBAND_SERVICE_UUID)
            streamCharacteristic = service?.getCharacteristic(LIFEBAND_STREAM_CHARACTERISTIC_UUID)

            val notify = streamCharacteristic?.properties ?: 0
            val supportsNotify = notify and BluetoothGattCharacteristic.PROPERTY_NOTIFY != 0
            return streamCharacteristic != null && supportsNotify
        }

        override fun initialize() {
            val characteristic = streamCharacteristic
            if (characteristic == null) {
                callback.onError("Streaming characteristic unavailable")
                return
            }

            setNotificationCallback(characteristic).with(onNotificationReceived)

            enableNotifications(characteristic)
                .fail { _, status ->
                    callback.onError("Failed to enable notifications ($status)")
                }
                .done {
                    callback.onReady(bluetoothDevice?.name)
                }
                .enqueue()
        }

        override fun onServicesInvalidated() {
            streamCharacteristic = null
            callback.onServicesInvalid()
        }
    }

    private val onNotificationReceived = DataReceivedCallback { _, data ->
        handleIncomingData(data)
    }

    private fun handleIncomingData(data: Data) {
        val raw = data.value ?: return
        try {
            val payload = JSONObject(String(raw, StandardCharsets.UTF_8))
            val reading = LifeBandReading(
                heartRate = payload.optInt("hr"),
                spo2 = payload.optInt("spo2"),
                hrv = payload.optInt("hrv"),
                systolic = payload.optInt("sbp"),
                diastolic = payload.optInt("dbp"),
                temperature = payload.optDouble("temp"),
                timestamp = payload.optString("timestamp")
            )
            callback.onReading(reading)
        } catch (exc: JSONException) {
            callback.onError("Invalid payload: ${exc.message}")
        }
    }

    companion object {
        // TODO: Align these UUIDs with the firmware on the ESP32 device.
        val LIFEBAND_SERVICE_UUID: UUID =
            UUID.fromString("12345678-1234-5678-1234-56789abcdef0")
        val LIFEBAND_STREAM_CHARACTERISTIC_UUID: UUID =
            UUID.fromString("12345678-1234-5678-1234-56789abcdef1")
    }
}
