//
//  ContentView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI

public struct ContentView: View {
    @EnvironmentObject private var store: ObservationStore
    
    public var body: some View {
        HomeView()
            .preferredColorScheme(.dark)
    }
}
