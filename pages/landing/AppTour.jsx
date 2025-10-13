import React, { useState, useEffect } from 'react';
import { TourGuideProvider, TourGuideZone, useTourGuideController } from 'rn-tourguide';
import AsyncStorage from '@react--native-async-storage/async-storage';
import { theme } from '../../styles/theme';

const AppTour = () => {
    const { start, canStart } = useTourGuideController('appTour');

    useEffect(() => {
        const checkTourStatus = async () => {
            const hasCompleted = await AsyncStorage.getItem('hasCompletedAppTour');
            if (!hasCompleted && canStart) {
                setTimeout(() => start(), 500);
            }
        };
        checkTourStatus();
    }, [canStart]);

    const handleStop = () => {
        AsyncStorage.setItem('hasCompletedAppTour', 'true');
    };

    return null;
};

export const AppTourProvider = ({ children }) => (
    <TourGuideProvider
        tourKey="appTour"
        labels={{ finish: "Finish", next: "Next", prev: "Previous", skip: "Skip" }}
        tooltipStyle={{ borderRadius: 8, backgroundColor: 'white' }}
        tooltipTextStyle={{ color: theme.colors.textDark }}
        androidStatusBarVisible={true}
    >
        {children}
    </TourGuideProvider>
);

export const TourZone = ({ zone, text, shape = 'rectangle' }) => (
    <TourGuideZone zone={zone} text={text} shape={shape} />
);