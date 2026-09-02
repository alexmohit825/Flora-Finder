//
//  GeminiBotanicalService.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import Foundation
import UIKit

public struct GeminiIdentifyResponse: Codable {
    public let matches: [PlantMatch]
    public let care: GeminiCareResponse?
}

public struct GeminiCareResponse: Codable {
    public let description: String
    public let category: String
    public let sun: String
    public let water: String
    public let soil: String
    public let humanToxicity: String
    public let petToxicity: String
}

public final class GeminiBotanicalService {
    public static let shared = GeminiBotanicalService()
    
    private let storageKey = "florafinder_custom_gemini_api_key"
    
    public var apiKey: String {
        get {
            if let customKey = UserDefaults.standard.string(forKey: storageKey), !customKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                return customKey.trimmingCharacters(in: .whitespacesAndNewlines)
            }
            if let envKey = ProcessInfo.processInfo.environment["GEMINI_API_KEY"], !envKey.isEmpty {
                return envKey
            }
            if let path = Bundle.main.path(forResource: "Secrets", ofType: "plist"),
               let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject],
               let key = dict["GEMINI_API_KEY"] as? String, !key.isEmpty {
                return key
            }
            return ""
        }
        set {
            UserDefaults.standard.set(newValue.trimmingCharacters(in: .whitespacesAndNewlines), forKey: storageKey)
        }
    }
    
    public var hasConfiguredApiKey: Bool {
        return !apiKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    private init() {}
    
    /// High-Precision Primary Botanical Identification using Gemini 3.6 Flash
    public func identifyPlant(image: UIImage, organ: OrganType = .auto) async throws -> (matches: [PlantMatch], care: PlantCareProfile) {
        guard hasConfiguredApiKey else {
            throw NSError(
                domain: "GeminiBotanicalService",
                code: 401,
                userInfo: [NSLocalizedDescriptionKey: "Gemini API Key Required. Please tap the Settings icon (⚙️) on the home screen to enter your Gemini API Key."]
            )
        }
        
        guard let imageData = image.jpegData(compressionQuality: 0.85) else {
            throw NSError(domain: "GeminiBotanicalService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Image compression failed"])
        }
        
        let base64Image = imageData.base64EncodedString()
        
        let urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=\(apiKey)"
        guard let url = URL(string: urlString) else {
            throw NSError(domain: "GeminiBotanicalService", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid Gemini Endpoint URL"])
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let promptText = """
        You are a master taxonomic botanist and horticultural scientist.
        Inspect the provided plant photo carefully and identify the EXACT botanical species.
        Do NOT just classify as "Plant" or "Houseplant" or "Orchid" — identify the precise species binomial (e.g. Phalaenopsis aphrodite / Moth Orchid, Ficus elastica / Rubber Plant, Monstera deliciosa, etc.), botanical family (e.g. Orchidaceae, Moraceae), genus, confidence score, and 2 alternative closest species.
        Also provide a complete horticultural care profile and pet toxicity rating (dogs/cats).
        
        Respond STRICTLY with a valid JSON object matching this schema:
        {
          "matches": [
            {
              "plantId": "string (lowercase_slug e.g. phalaenopsis_aphrodite)",
              "commonName": "string (e.g. Moth Orchid)",
              "scientificName": "string (binomial, e.g. Phalaenopsis aphrodite)",
              "family": "string (e.g. Orchidaceae)",
              "genus": "string (e.g. Phalaenopsis)",
              "confidence": number (0.0 to 1.0),
              "rank": integer (1, 2, 3)
            }
          ],
          "care": {
            "description": "string (botanical and natural habitat overview)",
            "category": "string (e.g. Epiphyte, Houseplant, Succulent)",
            "sun": "string (specific sunlight requirements)",
            "water": "string (specific hydration cycle and technique)",
            "soil": "string (potting substrate/bark composition)",
            "humanToxicity": "string",
            "petToxicity": "string (explicit toxicity warnings for dogs and cats)"
          }
        }
        """
        
        let requestBody: [String: Any] = [
            "contents": [
                [
                    "parts": [
                        ["text": promptText],
                        [
                            "inlineData": [
                                "mimeType": "image/jpeg",
                                "data": base64Image
                            ]
                        ]
                    ]
                ]
            ],
            "generationConfig": [
                "responseMimeType": "application/json"
            ]
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "GeminiBotanicalService", code: -3, userInfo: [NSLocalizedDescriptionKey: "Invalid network response from server"])
        }
        
        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown server error"
            throw NSError(
                domain: "GeminiBotanicalService",
                code: httpResponse.statusCode,
                userInfo: [NSLocalizedDescriptionKey: "Gemini API Error (HTTP \(httpResponse.statusCode)): \(errorBody)"]
            )
        }
        
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
           let candidates = json["candidates"] as? [[String: Any]],
           let firstCandidate = candidates.first,
           let content = firstCandidate["content"] as? [String: Any],
           let parts = content["parts"] as? [[String: Any]],
           let firstPart = parts.first,
           let text = firstPart["text"] as? String,
           let responseData = text.data(using: .utf8) {
            
            let parsed = try JSONDecoder().decode(GeminiIdentifyResponse.self, from: responseData)
            let topMatch = parsed.matches.first
            let common = topMatch?.commonName ?? "Botanical Specimen"
            let scientific = topMatch?.scientificName ?? "Plantae"
            
            let careProfile = PlantCareProfile(
                plantId: topMatch?.plantId ?? "specimen",
                commonName: common,
                scientificName: scientific,
                description: parsed.care?.description ?? "A distinguished botanical specimen.",
                category: parsed.care?.category ?? "Ornamental Plant",
                care: CareDetails(
                    sun: parsed.care?.sun ?? "Bright indirect sunlight.",
                    water: parsed.care?.water ?? "Water thoroughly when top substrate is dry.",
                    soil: parsed.care?.soil ?? "Well-draining potting substrate."
                ),
                toxicity: ToxicityDetails(
                    human: parsed.care?.humanToxicity ?? "Non-toxic under standard handling.",
                    pets: parsed.care?.petToxicity ?? "Check pet toxicity specifics."
                )
            )
            
            return (parsed.matches, careProfile)
        }
        
        throw NSError(domain: "GeminiBotanicalService", code: -4, userInfo: [NSLocalizedDescriptionKey: "Failed to parse Gemini response"])
    }
    
    /// Diagnoses plant health, pathogens, pests, and recovery regimens
    public func diagnosePlant(image: UIImage) async throws -> PlantDiseaseDiagnosis {
        guard hasConfiguredApiKey else {
            throw NSError(
                domain: "GeminiBotanicalService",
                code: 401,
                userInfo: [NSLocalizedDescriptionKey: "Gemini API Key Required. Please tap the Settings icon (⚙️) to configure your key."]
            )
        }
        
        guard let imageData = image.jpegData(compressionQuality: 0.85) else {
            throw NSError(domain: "GeminiBotanicalService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Image compression failed"])
        }
        
        let base64Image = imageData.base64EncodedString()
        
        let urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=\(apiKey)"
        guard let url = URL(string: urlString) else {
            throw NSError(domain: "GeminiBotanicalService", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid Gemini Endpoint"])
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let promptText = """
        You are a master plant pathologist and botanical doctor. Analyze this plant specimen and diagnose any diseases, leaf spots, pest infestations, fungal issues, or nutrient deficiencies.
        Respond strictly with a JSON object matching this schema:
        {
          "isDiseased": boolean,
          "healthScore": integer (0-100),
          "diseaseName": string,
          "scientificName": string,
          "confidence": number (0.0 - 1.0),
          "severity": string ("Healthy", "Low", "Medium", "High"),
          "symptoms": [string],
          "causes": [string],
          "treatment": {
            "immediate": string,
            "organic": string,
            "chemical": string
          },
          "prevention": [string]
        }
        """
        
        let requestBody: [String: Any] = [
            "contents": [
                [
                    "parts": [
                        ["text": promptText],
                        [
                            "inlineData": [
                                "mimeType": "image/jpeg",
                                "data": base64Image
                            ]
                        ]
                    ]
                ]
            ],
            "generationConfig": [
                "responseMimeType": "application/json"
            ]
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "GeminiBotanicalService", code: -3, userInfo: [NSLocalizedDescriptionKey: "Invalid network response"])
        }
        
        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown server error"
            throw NSError(
                domain: "GeminiBotanicalService",
                code: httpResponse.statusCode,
                userInfo: [NSLocalizedDescriptionKey: "Gemini Diagnosis API Error (HTTP \(httpResponse.statusCode)): \(errorBody)"]
            )
        }
        
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
           let candidates = json["candidates"] as? [[String: Any]],
           let firstCandidate = candidates.first,
           let content = firstCandidate["content"] as? [String: Any],
           let parts = content["parts"] as? [[String: Any]],
           let firstPart = parts.first,
           let text = firstPart["text"] as? String,
           let responseData = text.data(using: .utf8) {
            
            let diagnosis = try JSONDecoder().decode(PlantDiseaseDiagnosis.self, from: responseData)
            return diagnosis
        }
        
        throw NSError(domain: "GeminiBotanicalService", code: -4, userInfo: [NSLocalizedDescriptionKey: "Failed to parse Gemini JSON payload"])
    }
}
