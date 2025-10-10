package com.lifebandmaa.ble

data class LifeBandReading(
    val heartRate: Int,
    val spo2: Int,
    val hrv: Int,
    val systolic: Int,
    val diastolic: Int,
    val temperature: Double,
    val timestamp: String
)
