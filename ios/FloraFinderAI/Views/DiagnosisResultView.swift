//
//  DiagnosisResultView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI

public struct DiagnosisResultView: View {
    public let diagnosis: PlantDiseaseDiagnosis
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Botanical Pathology Rx")
                .font(.footnote)
                .fontWeight(.bold)
                .foregroundColor(.gray)
                .textCase(.uppercase)
            
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 6)
                        .frame(width: 58, height: 58)
                    Circle()
                        .trim(from: 0, to: CGFloat(diagnosis.healthScore) / 100.0)
                        .stroke(diagnosis.healthScore > 80 ? Color.emerald : Color.orange, lineWidth: 6)
                        .frame(width: 58, height: 58)
                        .rotationEffect(.degrees(-90))
                    Text("\(diagnosis.healthScore)%")
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 3) {
                    Text(diagnosis.diseaseName)
                        .font(.headline)
                        .foregroundColor(.white)
                    Text("Severity: \(diagnosis.severity)")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(diagnosis.severity == "Healthy" ? .emerald : .orange)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(white: 0.1))
            .cornerRadius(18)
            
            if !diagnosis.treatment.immediate.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Label("Immediate Action", systemImage: "bolt.fill")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.yellow)
                    Text(diagnosis.treatment.immediate)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.9))
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.yellow.opacity(0.1))
                .cornerRadius(16)
            }
            
            if !diagnosis.treatment.organic.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Label("Organic Recovery", systemImage: "leaf.fill")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.emerald)
                    Text(diagnosis.treatment.organic)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.9))
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.emerald.opacity(0.1))
                .cornerRadius(16)
            }
        }
    }
}
