// ─── React Query hooks for Traveloop API ────────────────────────────
// Wraps every backend endpoint in useQuery/useMutation with proper
// cache keys, invalidation, and type safety.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tripsApi,
  stopsApi,
  citiesApi,
  shareApi,
  communityApi,
  adminApi,
  type TripCreatePayload,
  type StopCreatePayload,
  type StopUpdatePayload,
} from "@/lib/api";
import { getToken } from "@/lib/api";

// ── Query keys ──────────────────────────────────────────────────────
export const qk = {
  trips: ["trips"] as const,
  trip: (id: string) => ["trip", id] as const,
  tripHealth: (id: string) => ["trip", id, "health"] as const,
  tripBudget: (id: string) => ["trip", id, "budget"] as const,
  tripDailyBudget: (id: string) => ["trip", id, "daily-budget"] as const,
  tripFreeDays: (id: string) => ["trip", id, "free-days"] as const,
  stops: (tripId: string) => ["trip", tripId, "stops"] as const,
  citySearch: (q: string) => ["cities", "search", q] as const,
  cityActivities: (cityId: number) => ["cities", cityId, "activities"] as const,
  sharedTrip: (token: string) => ["share", token] as const,
  community: ["community"] as const,
  adminStats: ["adminStats"] as const,
};

// ── Trip hooks ──────────────────────────────────────────────────────

/** Fetch all trips for the current user (with health scores) */
export function useTrips() {
  return useQuery({
    queryKey: qk.trips,
    queryFn: () => tripsApi.list(),
    enabled: !!getToken(),
    staleTime: 30_000,
  });
}

/** Fetch a single trip with its stops */
export function useTrip(tripId: string) {
  return useQuery({
    queryKey: qk.trip(tripId),
    queryFn: () => tripsApi.get(tripId),
    enabled: !!tripId && !!getToken(),
  });
}

/** Fetch trip health score */
export function useTripHealth(tripId: string) {
  return useQuery({
    queryKey: qk.tripHealth(tripId),
    queryFn: () => tripsApi.health(tripId),
    enabled: !!tripId && !!getToken(),
  });
}

/** Fetch trip budget summary */
export function useTripBudget(tripId: string) {
  return useQuery({
    queryKey: qk.tripBudget(tripId),
    queryFn: () => tripsApi.budget(tripId),
    enabled: !!tripId && !!getToken(),
  });
}

/** Fetch daily budget breakdown */
export function useTripDailyBudget(tripId: string) {
  return useQuery({
    queryKey: qk.tripDailyBudget(tripId),
    queryFn: () => tripsApi.dailyBudget(tripId),
    enabled: !!tripId && !!getToken(),
  });
}

/** Fetch free / dead days for a trip */
export function useTripFreeDays(tripId: string) {
  return useQuery({
    queryKey: qk.tripFreeDays(tripId),
    queryFn: () => tripsApi.freeDays(tripId),
    enabled: !!tripId && !!getToken(),
  });
}

/** Create a new trip */
export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TripCreatePayload) => tripsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips });
    },
  });
}

/** Copy/duplicate a trip */
export function useCopyTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => tripsApi.copy(tripId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips });
    },
  });
}

// ── Stop hooks ──────────────────────────────────────────────────────

/** Fetch all stops for a trip */
export function useStops(tripId: string) {
  return useQuery({
    queryKey: qk.stops(tripId),
    queryFn: () => stopsApi.list(tripId),
    enabled: !!tripId && !!getToken(),
  });
}

/** Create a new stop */
export function useCreateStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StopCreatePayload) => stopsApi.create(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trip(tripId) });
      qc.invalidateQueries({ queryKey: qk.stops(tripId) });
      qc.invalidateQueries({ queryKey: qk.tripHealth(tripId) });
      qc.invalidateQueries({ queryKey: qk.tripBudget(tripId) });
    },
  });
}

/** Update a stop */
export function useUpdateStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string; data: StopUpdatePayload }) =>
      stopsApi.update(tripId, stopId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trip(tripId) });
      qc.invalidateQueries({ queryKey: qk.stops(tripId) });
      qc.invalidateQueries({ queryKey: qk.tripHealth(tripId) });
      qc.invalidateQueries({ queryKey: qk.tripBudget(tripId) });
    },
  });
}

/** Delete a stop */
export function useDeleteStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => stopsApi.delete(tripId, stopId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trip(tripId) });
      qc.invalidateQueries({ queryKey: qk.stops(tripId) });
      qc.invalidateQueries({ queryKey: qk.tripHealth(tripId) });
      qc.invalidateQueries({ queryKey: qk.tripBudget(tripId) });
    },
  });
}

// ── City hooks ──────────────────────────────────────────────────────

/** Search cities by name (debounced on the calling side) */
export function useCitySearch(query: string) {
  return useQuery({
    queryKey: qk.citySearch(query),
    queryFn: () => citiesApi.search(query),
    enabled: query.length >= 2 && !!getToken(),
    staleTime: 60_000,
  });
}

/** Get activities for a city */
export function useCityActivities(cityId: number) {
  return useQuery({
    queryKey: qk.cityActivities(cityId),
    queryFn: () => citiesApi.activities(cityId),
    enabled: !!cityId && !!getToken(),
    staleTime: 120_000,
  });
}

// ── Share hooks ─────────────────────────────────────────────────────

/** Fetch a shared trip by its share token (no auth required) */
export function useSharedTrip(token: string) {
  return useQuery({
    queryKey: qk.sharedTrip(token),
    queryFn: () => shareApi.get(token),
    enabled: !!token,
  });
}

/** Fetch community posts */
export function useCommunity() {
  return useQuery({
    queryKey: qk.community,
    queryFn: () => communityApi.list(),
    enabled: !!getToken(),
    staleTime: 60_000,
  });
}

/** Fetch admin stats */
export function useAdminStats() {
  return useQuery({
    queryKey: qk.adminStats,
    queryFn: () => adminApi.stats(),
    enabled: !!getToken(),
    staleTime: 60_000,
  });
}
