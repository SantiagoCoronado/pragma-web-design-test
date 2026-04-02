#!/usr/bin/env swift
// thermal_sensor.swift — Read CPU/GPU die temperatures via IOHIDEventSystemClient
// No sudo required. Uses private IOKit APIs available on Apple Silicon.
//
// Usage:
//   swift thermal_sensor.swift          → human-readable output
//   swift thermal_sensor.swift --json   → JSON output for throttle.py
//   swift thermal_sensor.swift --avg    → just the average die temp as a float

import Foundation

// MARK: - Private IOKit function signatures

@_silgen_name("IOHIDEventSystemClientCreate")
func IOHIDEventSystemClientCreate(_ allocator: CFAllocator?) -> Unmanaged<AnyObject>?

@_silgen_name("IOHIDEventSystemClientSetMatching")
func IOHIDEventSystemClientSetMatching(_ client: AnyObject, _ matching: CFDictionary)

@_silgen_name("IOHIDEventSystemClientCopyServices")
func IOHIDEventSystemClientCopyServices(_ client: AnyObject) -> Unmanaged<CFArray>?

@_silgen_name("IOHIDServiceClientCopyProperty")
func IOHIDServiceClientCopyProperty(_ service: AnyObject, _ key: CFString) -> Unmanaged<AnyObject>?

@_silgen_name("IOHIDServiceClientCopyEvent")
func IOHIDServiceClientCopyEvent(_ service: AnyObject, _ type: Int64, _ matching: Int32, _ options: Int32) -> Unmanaged<AnyObject>?

@_silgen_name("IOHIDEventGetFloatValue")
func IOHIDEventGetFloatValue(_ event: AnyObject, _ field: Int32) -> Double

// MARK: - Temperature reading

struct TempReading {
    let name: String
    let temperature: Double
}

func readTemperatures() -> [TempReading] {
    guard let clientRef = IOHIDEventSystemClientCreate(kCFAllocatorDefault) else {
        return []
    }
    let client = clientRef.takeRetainedValue()

    // Match temperature sensors: PrimaryUsagePage=0xFF00, PrimaryUsage=5
    let matching: [String: Any] = [
        "PrimaryUsagePage": 0xFF00,
        "PrimaryUsage": 5
    ]
    IOHIDEventSystemClientSetMatching(client, matching as CFDictionary)

    guard let servicesRef = IOHIDEventSystemClientCopyServices(client) else {
        return []
    }
    let services = servicesRef.takeRetainedValue() as [AnyObject]

    let kIOHIDEventTypeTemperature: Int64 = 15
    let tempField: Int32 = (15 << 16) | 0  // 983040

    var readings: [TempReading] = []

    for service in services {
        // Get sensor name via IOHIDServiceClientCopyProperty
        var name = "unknown"
        if let nameRef = IOHIDServiceClientCopyProperty(service, "Product" as CFString) {
            let nameVal = nameRef.takeRetainedValue()
            if let nameStr = nameVal as? String {
                name = nameStr
            }
        }

        // Get temperature event
        guard let eventRef = IOHIDServiceClientCopyEvent(service, kIOHIDEventTypeTemperature, 0, 0) else {
            continue
        }
        let event = eventRef.takeRetainedValue()
        let temp = IOHIDEventGetFloatValue(event, tempField)

        // Filter garbage values (tdev sensors return ~-9201)
        if temp > -100 && temp < 150 {
            readings.append(TempReading(name: name, temperature: temp))
        }
    }

    return readings
}

// MARK: - Categorize sensors

func categorize(_ readings: [TempReading]) -> (die: [TempReading], other: [TempReading]) {
    var die: [TempReading] = []
    var other: [TempReading] = []

    for r in readings {
        let lower = r.name.lowercased()
        if lower.contains("tdie") || lower.contains("die") {
            die.append(r)
        } else {
            other.append(r)
        }
    }
    return (die, other)
}

// MARK: - Output

let readings = readTemperatures()
let (die, other) = categorize(readings)

let dieTemps = die.map { $0.temperature }
let avgDie = dieTemps.isEmpty ? 0.0 : dieTemps.reduce(0, +) / Double(dieTemps.count)
let maxDie = dieTemps.max() ?? 0.0

let args = CommandLine.arguments

if args.contains("--json") {
    // Build JSON manually to avoid Codable complexity in script mode
    var dieSensors = "["
    for (i, r) in die.enumerated() {
        if i > 0 { dieSensors += "," }
        dieSensors += "{\"name\":\"\(r.name)\",\"temp\":\(String(format: "%.1f", r.temperature))}"
    }
    dieSensors += "]"

    var otherSensors = "["
    let notable = other.filter {
        let l = $0.name.lowercased()
        return l.contains("nand") || l.contains("battery") || l.contains("gas") || l.contains("tcal")
    }
    for (i, r) in notable.enumerated() {
        if i > 0 { otherSensors += "," }
        otherSensors += "{\"name\":\"\(r.name)\",\"temp\":\(String(format: "%.1f", r.temperature))}"
    }
    otherSensors += "]"

    print("""
    {
      "avg_die_temp": \(String(format: "%.1f", avgDie)),
      "max_die_temp": \(String(format: "%.1f", maxDie)),
      "sensor_count": \(readings.count),
      "die_sensor_count": \(die.count),
      "die_sensors": \(dieSensors),
      "other_sensors": \(otherSensors)
    }
    """)
} else if args.contains("--avg") {
    print(String(format: "%.1f", avgDie))
} else {
    if die.isEmpty && other.isEmpty {
        print("No temperature sensors found (IOHIDEventSystemClient unavailable)")
    } else {
        print("CPU/GPU Die Temperatures:")
        for r in die.sorted(by: { $0.temperature > $1.temperature }) {
            print(String(format: "  %-20s %.1f°C", r.name, r.temperature))
        }
        if !die.isEmpty {
            print(String(format: "\n  Average: %.1f°C  Max: %.1f°C", avgDie, maxDie))
        }

        let notable = other.filter {
            let l = $0.name.lowercased()
            return l.contains("nand") || l.contains("battery") || l.contains("gas") || l.contains("tcal")
        }
        if !notable.isEmpty {
            print("\nOther Sensors:")
            for r in notable.sorted(by: { $0.temperature > $1.temperature }) {
                print(String(format: "  %-20s %.1f°C", r.name, r.temperature))
            }
        }
    }
}
