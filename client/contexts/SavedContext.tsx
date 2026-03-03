import React, { createContext, useContext, useState, useEffect } from 'react';

interface SavedContextType {
    savedJobIds: string[];
    savedWorkerIds: string[];
    saveJob: (id: string) => void;
    unsaveJob: (id: string) => void;
    saveWorker: (id: string) => void;
    unsaveWorker: (id: string) => void;
    isJobSaved: (id: string) => boolean;
    isWorkerSaved: (id: string) => boolean;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('savedJobIds');
        return saved ? JSON.parse(saved) : [];
    });

    const [savedWorkerIds, setSavedWorkerIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('savedWorkerIds');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('savedJobIds', JSON.stringify(savedJobIds));
    }, [savedJobIds]);

    useEffect(() => {
        localStorage.setItem('savedWorkerIds', JSON.stringify(savedWorkerIds));
    }, [savedWorkerIds]);

    const saveJob = (id: string) => {
        if (!savedJobIds.includes(id)) {
            setSavedJobIds([...savedJobIds, id]);
        }
    };

    const unsaveJob = (id: string) => {
        setSavedJobIds(savedJobIds.filter(jobId => jobId !== id));
    };

    const saveWorker = (id: string) => {
        if (!savedWorkerIds.includes(id)) {
            setSavedWorkerIds([...savedWorkerIds, id]);
        }
    };

    const unsaveWorker = (id: string) => {
        setSavedWorkerIds(savedWorkerIds.filter(workerId => workerId !== id));
    };

    const isJobSaved = (id: string) => savedJobIds.includes(id);
    const isWorkerSaved = (id: string) => savedWorkerIds.includes(id);

    return (
        <SavedContext.Provider value={{
            savedJobIds,
            savedWorkerIds,
            saveJob,
            unsaveJob,
            saveWorker,
            unsaveWorker,
            isJobSaved,
            isWorkerSaved
        }}>
            {children}
        </SavedContext.Provider>
    );
};

export const useSaved = () => {
    const context = useContext(SavedContext);
    if (context === undefined) {
        throw new Error('useSaved must be used within a SavedProvider');
    }
    return context;
};
