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
    @State private var selectedTab = 0
    
    public var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Scanner", systemImage: "camera.viewfinder")
                }
                .tag(0)
            
            LogbookView()
                .tabItem {
                    Label("Logbook", systemImage: "leaf.fill")
                }
                .badge(store.observations.count)
                .tag(1)
            
            SettingsView()
                .tabItem {
                    Label("AI Engine", systemImage: "gearshape.fill")
                }
                .tag(2)
        }
        .tint(.purple)
        .preferredColorScheme(.dark)
    }
}
