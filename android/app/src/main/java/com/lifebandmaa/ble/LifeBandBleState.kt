package com.lifebandmaa.ble

import java.util.concurrent.atomic.AtomicReference

data class BleStartOptions(
    val deviceId: String? = null,
    val macAddress: String? = null,
    val deviceNamePrefix: String? = null
)

object LifeBandBleState {
    private val patientIdRef = AtomicReference<String?>(null)
    private val uploadEndpointRef = AtomicReference<String?>(null)
    private val startOptionsRef = AtomicReference<BleStartOptions?>(null)

    var patientId: String?
        get() = patientIdRef.get()
        set(value) {
            patientIdRef.set(value?.takeIf { it.isNotBlank() })
        }

    var uploadEndpoint: String?
        get() = uploadEndpointRef.get()
        set(value) {
            uploadEndpointRef.set(value?.takeIf { it.isNotBlank() })
        }

    var startOptions: BleStartOptions?
        get() = startOptionsRef.get()
        set(value) {
            startOptionsRef.set(value)
        }

    fun reset() {
        startOptionsRef.set(null)
    }
}
