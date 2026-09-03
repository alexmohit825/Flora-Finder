//
//  PlantObservation.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import Foundation
import SwiftUI

public enum OrganType: String, Codable, CaseIterable, Identifiable {
    case auto = "auto"
    case flower = "flower"
    case leaf = "leaf"
    case fruit = "fruit"
    case bark = "bark"
    case habit = "habit"
    
    public var id: String { rawValue }
    
    public var displayName: String {
        switch self {
        case .auto: return "Auto"
        case .flower: return "Flower"
        case .leaf: return "Leaf"
        case .fruit: return "Fruit"
        case .bark: return "Bark"
        case .habit: return "Habit"
        }
    }
    
    public var iconName: String {
        switch self {
        case .auto: return "sparkles"
        case .flower: return "camera.macro"
        case .leaf: return "leaf.fill"
        case .fruit: return "circle.grid.cross.fill"
        case .bark: return "tree.fill"
        case .habit: return "globe.americas.fill"
        }
    }
}

public struct PlantMatch: Identifiable, Codable, Equatable {
    public var id: String { plantId }
    public let plantId: String
    public let commonName: String
    public let scientificName: String
    public let family: String
    public let genus: String
    public let confidence: Double
    public let rank: Int
    public let sourceEngine: String
    
    public init(
        plantId: String,
        commonName: String,
        scientificName: String,
        family: String,
        genus: String,
        confidence: Double,
        rank: Int,
        sourceEngine: String = "Apple Intelligence"
    ) {
        self.plantId = plantId
        self.commonName = commonName
        self.scientificName = scientificName
        self.family = family
        self.genus = genus
        self.confidence = confidence
        self.rank = rank
        self.sourceEngine = sourceEngine
    }
    
    private enum CodingKeys: String, CodingKey {
        case plantId, commonName, scientificName, family, genus, confidence, rank, sourceEngine
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.plantId = try container.decodeIfPresent(String.self, forKey: .plantId) ?? UUID().uuidString
        self.commonName = try container.decodeIfPresent(String.self, forKey: .commonName) ?? "Identified Plant"
        self.scientificName = try container.decodeIfPresent(String.self, forKey: .scientificName) ?? "Plantae"
        self.family = try container.decodeIfPresent(String.self, forKey: .family) ?? ""
        self.genus = try container.decodeIfPresent(String.self, forKey: .genus) ?? ""
        self.confidence = try container.decodeIfPresent(Double.self, forKey: .confidence) ?? 0.90
        self.rank = try container.decodeIfPresent(Int.self, forKey: .rank) ?? 1
        self.sourceEngine = try container.decodeIfPresent(String.self, forKey: .sourceEngine) ?? "Google Gemini 3.6 Flash"
    }
}

public struct PlantDiseaseDiagnosis: Codable, Equatable {
    public let isDiseased: Bool
    public let healthScore: Int
    public let diseaseName: String
    public let scientificName: String
    public let confidence: Double
    public let severity: String
    public let symptoms: [String]
    public let causes: [String]
    public let treatment: DiseaseTreatment
    public let prevention: [String]
    
    public init(
        isDiseased: Bool,
        healthScore: Int,
        diseaseName: String,
        scientificName: String,
        confidence: Double,
        severity: String,
        symptoms: [String],
        causes: [String],
        treatment: DiseaseTreatment,
        prevention: [String]
    ) {
        self.isDiseased = isDiseased
        self.healthScore = healthScore
        self.diseaseName = diseaseName
        self.scientificName = scientificName
        self.confidence = confidence
        self.severity = severity
        self.symptoms = symptoms
        self.causes = causes
        self.treatment = treatment
        self.prevention = prevention
    }
    
    private enum CodingKeys: String, CodingKey {
        case isDiseased, healthScore, diseaseName, scientificName, confidence, severity, symptoms, causes, treatment, prevention
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.isDiseased = try container.decodeIfPresent(Bool.self, forKey: .isDiseased) ?? false
        self.healthScore = try container.decodeIfPresent(Int.self, forKey: .healthScore) ?? 95
        self.diseaseName = try container.decodeIfPresent(String.self, forKey: .diseaseName) ?? "Healthy Specimen"
        self.scientificName = try container.decodeIfPresent(String.self, forKey: .scientificName) ?? "Plantae"
        self.confidence = try container.decodeIfPresent(Double.self, forKey: .confidence) ?? 0.95
        self.severity = try container.decodeIfPresent(String.self, forKey: .severity) ?? "Healthy"
        self.symptoms = try container.decodeIfPresent([String].self, forKey: .symptoms) ?? []
        self.causes = try container.decodeIfPresent([String].self, forKey: .causes) ?? []
        self.treatment = try container.decodeIfPresent(DiseaseTreatment.self, forKey: .treatment) ?? DiseaseTreatment(immediate: "Maintain proper lighting and hydration.", organic: "Ensure adequate airflow.", chemical: "None required.")
        self.prevention = try container.decodeIfPresent([String].self, forKey: .prevention) ?? ["Avoid overwatering", "Ensure proper drainage"]
    }
}

public struct DiseaseTreatment: Codable, Equatable {
    public let immediate: String
    public let organic: String
    public let chemical: String
    
    public init(immediate: String, organic: String, chemical: String) {
        self.immediate = immediate
        self.organic = organic
        self.chemical = chemical
    }
    
    private enum CodingKeys: String, CodingKey {
        case immediate, organic, chemical
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.immediate = try container.decodeIfPresent(String.self, forKey: .immediate) ?? "Monitor plant carefully."
        self.organic = try container.decodeIfPresent(String.self, forKey: .organic) ?? "Ensure adequate sunlight and clean water."
        self.chemical = try container.decodeIfPresent(String.self, forKey: .chemical) ?? "None required."
    }
}

public struct PlantCareProfile: Codable, Equatable {
    public let plantId: String
    public let commonName: String
    public let scientificName: String
    public let description: String
    public let category: String
    public let care: CareDetails
    public let toxicity: ToxicityDetails
    
    public init(
        plantId: String,
        commonName: String,
        scientificName: String,
        description: String,
        category: String,
        care: CareDetails,
        toxicity: ToxicityDetails
    ) {
        self.plantId = plantId
        self.commonName = commonName
        self.scientificName = scientificName
        self.description = description
        self.category = category
        self.care = care
        self.toxicity = toxicity
    }
}

public struct CareDetails: Codable, Equatable {
    public let sun: String
    public let water: String
    public let soil: String
    
    public init(sun: String, water: String, soil: String) {
        self.sun = sun
        self.water = water
        self.soil = soil
    }
}

public struct ToxicityDetails: Codable, Equatable {
    public let human: String
    public let pets: String
    
    public init(human: String, pets: String) {
        self.human = human
        self.pets = pets
    }
}

public struct PlantObservation: Identifiable, Codable, Equatable {
    public let id: String
    public let timestamp: Date
    public let imageData: Data
    public let organ: OrganType
    public let scanMode: String
    public var matches: [PlantMatch]
    public var diseaseDiagnosis: PlantDiseaseDiagnosis?
    public var careProfile: PlantCareProfile?
    public var aiProvider: String
    
    public init(
        id: String = UUID().uuidString,
        timestamp: Date = Date(),
        imageData: Data,
        organ: OrganType = .auto,
        scanMode: String = "identify",
        matches: [PlantMatch] = [],
        diseaseDiagnosis: PlantDiseaseDiagnosis? = nil,
        careProfile: PlantCareProfile? = nil,
        aiProvider: String = "Apple Intelligence"
    ) {
        self.id = id
        self.timestamp = timestamp
        self.imageData = imageData
        self.organ = organ
        self.scanMode = scanMode
        self.matches = matches
        self.diseaseDiagnosis = diseaseDiagnosis
        self.careProfile = careProfile
        self.aiProvider = aiProvider
    }
}
