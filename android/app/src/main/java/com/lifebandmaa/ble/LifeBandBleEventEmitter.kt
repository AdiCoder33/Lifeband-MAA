package com.lifebandmaa.ble

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.lang.ref.WeakReference

object LifeBandBleEventEmitter {
    const val STATUS_EVENT = "LifeBandBleStatus"
    const val READING_EVENT = "LifeBandBleReading"
    const val DEVICE_EVENT = "LifeBandBleDevice"
    const val ERROR_EVENT = "LifeBandBleError"

    private var reactContext: WeakReference<ReactApplicationContext>? = null

    fun initialize(context: ReactApplicationContext) {
        reactContext = WeakReference(context)
    }

    private fun emit(event: String, payload: Any?) {
        val context = reactContext?.get()
        if (context != null && context.hasActiveReactInstance()) {
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(event, payload)
        }
    }

    fun sendStatus(status: String, message: String? = null) {
        val map = Arguments.createMap().apply {
            putString("status", status)
            if (!message.isNullOrBlank()) {
                putString("message", message)
            }
        }
        emit(STATUS_EVENT, map)
    }

    fun sendDevice(event: String, deviceId: String, deviceName: String?, rssi: Int?) {
        val map = Arguments.createMap().apply {
            putString("event", event)
            putMap(
                "device",
                Arguments.createMap().apply {
                    putString("id", deviceId)
                    if (!deviceName.isNullOrBlank()) {
                        putString("name", deviceName)
                    }
                    if (rssi != null) {
                        putInt("rssi", rssi)
                    }
                }
            )
        }
        emit(DEVICE_EVENT, map)
    }

    fun sendReading(reading: LifeBandReading) {
        val map = Arguments.createMap().apply {
            putMap(
                "reading",
                Arguments.createMap().apply {
                    putDouble("heartRate", reading.heartRate.toDouble())
                    putDouble("spo2", reading.spo2.toDouble())
                    putDouble("hrv", reading.hrv.toDouble())
                    putDouble("systolic", reading.systolic.toDouble())
                    putDouble("diastolic", reading.diastolic.toDouble())
                    putDouble("temperature", reading.temperature)
                    putString("timestamp", reading.timestamp)
                    LifeBandBleState.patientId?.let { putString("patientId", it) }
                }
            )
        }
        emit(READING_EVENT, map)
    }

    fun sendError(message: String) {
        emit(ERROR_EVENT, message)
    }
}
