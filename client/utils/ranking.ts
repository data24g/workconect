import { User, Job } from '../types';
import { JobResponse } from '../apis/api_job';
import { WorkerAd } from '../apis/api_worker_ad';

export interface RankingContext {
    viewerIndustry?: string;
    viewerSkills?: string[];
    viewerActiveJobsSkills?: string[];
}

/**
 * RECRUITMENT-FIRST HOME FEED RANKING (Worker Ads for Employers)
 * 
 * Target Home score structure:
 * HomeScore = 
 *   (BaseQuality 
 *   + SkillMatch * HighWeight 
 *   + InteractionScore * MediumWeight 
 *   + ProfileCompleteness * MediumWeight) 
 *   * FollowMultiplier (<= 1.4) 
 *   * PremiumMultiplier (<= 1.15) 
 *   / TimeDecay
 */
export const rankHomeFeed = <T extends {
    postedAt?: string;
    createdAt?: string;
    businessId?: string;
    workerId?: string;
    rating?: number;
    ratingCount?: number;
    title?: string;
    description?: string;
    skills?: string[];
    avatar?: string;
}>(
    items: T[],
    currentUserId: string | undefined,
    followedIds: string[],
    isPremiumAuthorFunc: (id: string) => boolean = () => false,
    context?: RankingContext
): T[] => {
    if (!items.length) return [];

    const now = new Date();
    const viewerContextText = [
        context?.viewerIndustry,
        ...(context?.viewerSkills || []),
        ...(context?.viewerActiveJobsSkills || [])
    ].filter(Boolean).join(' ').toLowerCase();

    const scoredItems = items.map(item => {
        const dateStr = item.postedAt || item.createdAt || now.toISOString();
        const postedDate = new Date(dateStr);
        const hoursOld = Math.max(0, (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60));

        // 1. Base Quality (Starts at 50)
        let baseQuality = 50;

        // 2. Skill Match (High Weight: 0-100)
        let skillMatchScore = 0;
        if (viewerContextText && (item.skills?.length || item.title)) {
            const itemText = (item.title + ' ' + (item.skills?.join(' ') || '')).toLowerCase();
            const keywords = viewerContextText.split(/[\s,]+/).filter(k => k.length > 2);
            if (keywords.length > 0) {
                const matches = keywords.filter(k => itemText.includes(k)).length;
                skillMatchScore = (matches / Math.max(1, keywords.length)) * 100;
            }
        }

        // 3. Interaction Score (Medium Weight: 0-50)
        const rating = item.rating || 0;
        const count = item.ratingCount || 0;
        const interactionScore = Math.min(50, rating * Math.log2(count + 2) * 5);

        // 4. Profile Completeness (Medium Weight: 0-40)
        let completenessScore = 0;
        if (item.description && item.description.length > 100) completenessScore += 15;
        if (item.avatar && !item.avatar.includes('default')) completenessScore += 10;
        if (item.skills && item.skills.length >= 3) completenessScore += 10;
        if (item.title && item.title.length > 5) completenessScore += 5;

        // 5. Multipliers
        const authorId = item.businessId || item.workerId || '';
        const isFollowed = followedIds.includes(authorId);
        const isPremium = isPremiumAuthorFunc(authorId);

        const followMultiplier = isFollowed ? 1.25 : 1.0;
        const premiumMultiplier = isPremium ? 1.12 : 1.0;

        // 6. Time Decay
        const timeDecay = Math.pow(hoursOld + 2, 0.8); // Softer decay to allow surfacing new users

        const rawScore = (baseQuality + (skillMatchScore * 1.5) + interactionScore + completenessScore);
        const score = (rawScore * followMultiplier * premiumMultiplier) / timeDecay;

        return { item, score, authorId };
    });

    // Sort by score
    const sorted = scoredItems.sort((a, b) => b.score - a.score);

    // 7. Anti-clustering: Avoid showing too many posts from the same author consecutively
    const finalFeed: T[] = [];
    const remaining = [...sorted];

    while (remaining.length > 0) {
        let bestIndex = 0;
        const lastAuthorId = finalFeed.length > 0 ? (finalFeed[finalFeed.length - 1] as any).workerId || (finalFeed[finalFeed.length - 1] as any).businessId : null;

        for (let i = 0; i < Math.min(remaining.length, 5); i++) {
            const currentAuthorId = (remaining[i].item as any).workerId || (remaining[i].item as any).businessId;
            if (currentAuthorId !== lastAuthorId) {
                bestIndex = i;
                break;
            }
        }

        finalFeed.push(remaining.splice(bestIndex, 1)[0].item);
    }

    return finalFeed;
};

/**
 * RECRUITMENT-FIRST JOB LISTING RANKING (Employer Posts for Seekers)
 * 
 * Constraints:
 * - Relevance (skill match) is top signal.
 * - Premium boost is subtle.
 * - Anti-spam rules.
 */
export const rankJobListings = (
    jobs: JobResponse[],
    user: User | null,
    isPremiumBusiness: (id: string) => boolean = () => false
): JobResponse[] => {
    if (!jobs.length) return [];

    const now = new Date();
    const userSkillsText = [
        user?.title,
        user?.bio,
        ...(user?.skills || [])
    ].filter(Boolean).join(' ').toLowerCase();

    return jobs
        .filter(job => job.status === 'OPEN')
        .map(job => {
            const postedDate = new Date(job.postedAt);
            const hoursOld = Math.max(0, (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60));

            // 1. Relevance Score (0 to 100) - Dominant signal
            const jobText = (job.title + ' ' + (job.requirements || '') + ' ' + (job.description || '')).toLowerCase();
            let relevance = 0;
            if (userSkillsText) {
                const keywords = userSkillsText.split(/[\s,]+/).filter(s => s.length > 2);
                const matches = keywords.filter(k => jobText.includes(k)).length;
                relevance = (matches / Math.max(1, keywords.length)) * 100;
            }

            // 2. Reputation Score (Rating 0-5 -> 0-60)
            const reputation = (job.businessRating || 0) * 12;

            // 3. Recency Score (Exponential decay)
            const recency = Math.exp(-hoursOld / 72) * 40; // Halflife of 72 hours

            // 4. Combined weighted score
            let finalScore = (relevance * 1.2) + reputation + recency;

            // 5. Premium Boost (Subtle: +10% max)
            if (isPremiumBusiness(job.businessId)) {
                finalScore *= 1.1;
            }

            // 6. Anti-spam (Penalty for incomplete posts)
            if (!job.description || job.description.length < 50) finalScore *= 0.7;
            if (!job.requirements || job.requirements.length < 10) finalScore *= 0.8;

            return { job, score: finalScore };
        })
        .sort((a, b) => b.score - a.score)
        .map(wrapper => wrapper.job);
};

/**
 * CALCULATE JOB MATCH PERCENTAGE (0-100)
 * Weights: Skills (50%), Industry (30%), Location (20%)
 */
export const calculateJobMatchPercentage = (job: JobResponse, user: User | null): number => {
    if (!user) return 0;

    let skillScore = 0;
    const userSkills = user.skills || [];
    const jobRequirements = job.requirements ? job.requirements.split(/[\s,]+/).filter(s => s.length > 2).map(s => s.toLowerCase()) : [];

    if (userSkills.length > 0 && jobRequirements.length > 0) {
        const matches = userSkills.filter(us =>
            jobRequirements.some(req => us.toLowerCase().includes(req) || req.includes(us.toLowerCase()))
        ).length;
        skillScore = (matches / Math.max(1, jobRequirements.length)) * 100;
    }

    let industryScore = 0;
    if (user.industry && job.industry && user.industry.toLowerCase() === job.industry.toLowerCase()) {
        industryScore = 100;
    } else if (user.industry && job.title && job.title.toLowerCase().includes(user.industry.toLowerCase())) {
        industryScore = 70;
    }

    let locationScore = 0;
    const userLoc = user.location?.toLowerCase() || "";
    const jobLoc = job.location?.toLowerCase() || "";
    if (userLoc && jobLoc) {
        if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) {
            locationScore = 100;
        }
    }

    // Weighted average
    const finalMatch = (skillScore * 0.5) + (industryScore * 0.3) + (locationScore * 0.2);

    // Impact of Profile Completeness (Bonus/Penalty)
    let completeness = 0;
    if (user.fullName) completeness += 20;
    if (user.phone) completeness += 20;
    if (user.dob) completeness += 20;
    if (user.skills && user.skills.length > 0) completeness += 20;
    if (user.industry) completeness += 20;

    // Scale match by completeness (if profile is empty, match shouldn't be high)
    const completenessMultiplier = 0.5 + (completeness / 100) * 0.5; // 0.5 to 1.0

    return Math.min(100, Math.round(finalMatch * completenessMultiplier));
};

/**
 * RANK SUGGESTIONS (Legacy Wrapper)
 */
export const rankSuggestions = <T extends {
    id: string;
    name: string;
    role?: string;
    type?: 'USER' | 'COMPANY';
    mutualConnections?: number;
    industry?: string;
    skills?: string[];
    rating?: number;
}>(
    items: T[],
    user: User | null,
    followedIds: string[],
    context?: RankingContext & { excludeId?: string; targetType?: 'USER' | 'COMPANY'; filterFollowed?: boolean }
): T[] => {
    // Forward to new V2 ranker and strip reasons for backward compatibility
    return rankSuggestionsWithReason(items, user, followedIds, context).map(r => r.item);
};
export const rankSuggestionsWithReason = <T extends {
    id: string;
    name: string;
    role?: string;
    type?: 'USER' | 'COMPANY';
    mutualConnections?: number;
    industry?: string;
    skills?: string[];
    rating?: number;
    lastActiveAt?: string;
}>(
    items: T[],
    user: User | null,
    followedIds: string[],
    context?: RankingContext & { excludeId?: string; targetType?: 'USER' | 'COMPANY'; filterFollowed?: boolean }
): { item: T; reason: string }[] => {
    if (!items.length) return [];

    const viewerContextText = [
        context?.viewerIndustry,
        ...(context?.viewerSkills || []),
        ...(user?.industry ? [user.industry] : []),
        ...(user?.skills || []),
    ].filter(Boolean).join(' ').toLowerCase();

    // Time-based seed for micro-variation (Changes every hour)
    const timeSeed = new Date().getHours() + new Date().getDate();

    const scored = items
        .filter(item => {
            // Strict Filter: Remove followed users if requested (default behavior for Suggestions widget)
            if (context?.filterFollowed && followedIds.includes(item.id)) return false;
            // Exclusion
            if (context?.excludeId === item.id) return false;
            // Type Filter
            if (context?.targetType && item.type !== context.targetType) return false;
            return true;
        })
        .map(item => {
            let score = 50; // Base score
            let primaryReason = "Hoạt động tích cực";
            let topReasonScore = 0;

            // 1. Peer Relevance (Industry/Skill Match) - High Priority
            const itemSkills = (item.skills || []).join(' ').toLowerCase();
            const itemIndustry = (item.industry || '').toLowerCase();
            const itemText = (item.name + ' ' + (item.role || '') + ' ' + itemIndustry + ' ' + itemSkills).toLowerCase();

            if (viewerContextText) {
                const keywords = viewerContextText.split(/[\s,]+/).filter(k => k.length > 2);

                // Skill Match Check
                const skillKeywords = (context?.viewerSkills || []).map(s => s.toLowerCase());
                const matchingSkills = skillKeywords.filter(k => itemText.includes(k));

                if (matchingSkills.length > 0) {
                    const skillScore = matchingSkills.length * 15;
                    score += skillScore;
                    if (skillScore > topReasonScore) {
                        topReasonScore = skillScore;
                        primaryReason = `Phù hợp kỹ năng ${matchingSkills[0]}`; // e.g. "Phù hợp kỹ năng React"
                    }
                }

                // General Context Match
                const totalMatches = keywords.filter(k => itemText.includes(k)).length;
                const relevanceScore = (totalMatches / Math.max(1, keywords.length)) * 30;
                score += relevanceScore;

                if (relevanceScore > topReasonScore && totalMatches > 0) {
                    topReasonScore = relevanceScore;
                    // Try to catch industry match explicitly
                    if (context?.viewerIndustry && itemIndustry.includes(context.viewerIndustry.toLowerCase())) {
                        primaryReason = `Cùng ngành ${context.viewerIndustry}`;
                    } else {
                        primaryReason = "Hồ sơ liên quan";
                    }
                }
            }

            // 2. Mutual Connections (0-30 points)
            if (item.mutualConnections && item.mutualConnections > 0) {
                const connectionScore = Math.min(30, item.mutualConnections * 5);
                score += connectionScore;
                if (connectionScore > topReasonScore) {
                    topReasonScore = connectionScore;
                    primaryReason = `${item.mutualConnections} bạn chung`;
                }
            }

            // 3. Reputation (Rating 0-5 -> 0-10 points) - Reduced weight
            score += (item.rating || 0) * 2;

            // 4. Role Alignment
            if (context?.targetType && item.type === context.targetType) {
                score += 10;
            }

            // 5. Following Status Penalty (If not filtered out)
            if (followedIds.includes(item.id)) {
                score -= 200; // Heavily penalize to push to bottom
                primaryReason = "Đang theo dõi";
            }

            // 6. Micro-variation (Noise)
            // Add deterministic noise based on Item ID + Time Seed so it's stable but rotates periodically
            const noise = (item.id.charCodeAt(0) + timeSeed) % 10;
            score += noise;
            return { item, score, reason: primaryReason };
        });

    return scored
        .sort((a, b) => b.score - a.score)
        .map(s => ({ item: s.item, reason: s.reason }));
};

/**
 * WORKER RANKING ALGORITHM
 * FinalScore(w) = 0.4*Recency + 0.3*SkillMatch + 0.2*LocationMatch + 0.1*UserInteraction
 */
export const calculateWorkerScore = (
    worker: {
        createdAt?: string;
        skills?: string[];
        location?: string;
        rating?: number;
    },
    user: {
        skills?: string[];
        location?: string;
    } | null,
    isSaved: boolean = false,
    isProposed: boolean = false
): number => {
    const now = new Date();

    // 1. Recency Score (0.4) - Exponential decay with 7-day half-life
    const createdAt = worker.createdAt ? new Date(worker.createdAt) : now;
    const hoursOld = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
    const recencyScore = Math.max(0, 100 * Math.exp(-hoursOld / 168));

    // 2. Skill Match (0.3)
    let skillMatchScore = 0;
    const userSkills = user?.skills || [];
    const workerSkills = worker.skills || [];
    if (userSkills.length > 0 && workerSkills.length > 0) {
        const matches = workerSkills.filter(ws =>
            userSkills.some(us => us.toLowerCase().includes(ws.toLowerCase()) || ws.toLowerCase().includes(us.toLowerCase()))
        ).length;
        skillMatchScore = (matches / Math.max(1, userSkills.length)) * 100;
        if (skillMatchScore > 100) skillMatchScore = 100;
    }

    // 3. Location Match (0.2)
    let locationMatchScore = 0;
    const userLoc = user?.location?.toLowerCase() || "";
    const workerLoc = worker.location?.toLowerCase() || "";
    if (userLoc && workerLoc) {
        if (workerLoc.includes(userLoc) || userLoc.includes(workerLoc)) {
            locationMatchScore = 100;
        }
    }

    // 4. User Interaction (0.1)
    let interactionScore = (worker.rating || 0) * 20; // 0-5 stars -> 0-100
    if (isSaved) interactionScore = Math.min(100, interactionScore + 30);
    if (isProposed) interactionScore = Math.min(100, interactionScore + 50);

    return (0.4 * recencyScore) + (0.3 * skillMatchScore) + (0.2 * locationMatchScore) + (0.1 * interactionScore);
};
