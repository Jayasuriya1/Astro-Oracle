export interface LocationResult {
  placeName: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Built-in high-precision database of major Indian cities, towns & international hubs
// Provides instantaneous, offline-ready search results
export const POPULAR_LOCATIONS: LocationResult[] = [
  // Tamil Nadu & South India
  { placeName: 'Chennai, Tamil Nadu, India', city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { placeName: 'Madurai, Tamil Nadu, India', city: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198 },
  { placeName: 'Coimbatore, Tamil Nadu, India', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558 },
  { placeName: 'Tiruchirappalli (Trichy), Tamil Nadu, India', city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', latitude: 10.7905, longitude: 78.7047 },
  { placeName: 'Salem, Tamil Nadu, India', city: 'Salem', state: 'Tamil Nadu', country: 'India', latitude: 11.6643, longitude: 78.1460 },
  { placeName: 'Tirunelveli, Tamil Nadu, India', city: 'Tirunelveli', state: 'Tamil Nadu', country: 'India', latitude: 8.7139, longitude: 77.7567 },
  { placeName: 'Vellore, Tamil Nadu, India', city: 'Vellore', state: 'Tamil Nadu', country: 'India', latitude: 12.9165, longitude: 79.1325 },
  { placeName: 'Thanjavur, Tamil Nadu, India', city: 'Thanjavur', state: 'Tamil Nadu', country: 'India', latitude: 10.7870, longitude: 79.1378 },
  { placeName: 'Erode, Tamil Nadu, India', city: 'Erode', state: 'Tamil Nadu', country: 'India', latitude: 11.3410, longitude: 77.7172 },
  { placeName: 'Tiruppur, Tamil Nadu, India', city: 'Tiruppur', state: 'Tamil Nadu', country: 'India', latitude: 11.1085, longitude: 77.3411 },
  { placeName: 'Dindigul, Tamil Nadu, India', city: 'Dindigul', state: 'Tamil Nadu', country: 'India', latitude: 10.3673, longitude: 77.9803 },
  { placeName: 'Kanchipuram, Tamil Nadu, India', city: 'Kanchipuram', state: 'Tamil Nadu', country: 'India', latitude: 12.8342, longitude: 79.7036 },
  { placeName: 'Nagercoil (Kanyakumari), Tamil Nadu, India', city: 'Nagercoil', state: 'Tamil Nadu', country: 'India', latitude: 8.1833, longitude: 77.4119 },
  { placeName: 'Puducherry (Pondicherry), India', city: 'Puducherry', state: 'Puducherry', country: 'India', latitude: 11.9416, longitude: 79.8083 },
  { placeName: 'Bengaluru (Bangalore), Karnataka, India', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { placeName: 'Mysuru (Mysore), Karnataka, India', city: 'Mysuru', state: 'Karnataka', country: 'India', latitude: 12.2958, longitude: 76.6394 },
  { placeName: 'Hyderabad, Telangana, India', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867 },
  { placeName: 'Visakhapatnam, Andhra Pradesh, India', city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185 },
  { placeName: 'Vijayawada, Andhra Pradesh, India', city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', latitude: 16.5062, longitude: 80.6480 },
  { placeName: 'Thiruvananthapuram, Kerala, India', city: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366 },
  { placeName: 'Kochi (Cochin), Kerala, India', city: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673 },
  { placeName: 'Kozhikode (Calicut), Kerala, India', city: 'Kozhikode', state: 'Kerala', country: 'India', latitude: 11.2588, longitude: 75.7804 },

  // Maharashtra, Gujarat & West India
  { placeName: 'Mumbai, Maharashtra, India', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { placeName: 'Pune, Maharashtra, India', city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567 },
  { placeName: 'Nagpur, Maharashtra, India', city: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882 },
  { placeName: 'Nashik, Maharashtra, India', city: 'Nashik', state: 'Maharashtra', country: 'India', latitude: 19.9975, longitude: 73.7898 },
  { placeName: 'Ahmedabad, Gujarat, India', city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714 },
  { placeName: 'Surat, Gujarat, India', city: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311 },
  { placeName: 'Vadodara, Gujarat, India', city: 'Vadodara', state: 'Gujarat', country: 'India', latitude: 22.3072, longitude: 73.1812 },
  { placeName: 'Rajkot, Gujarat, India', city: 'Rajkot', state: 'Gujarat', country: 'India', latitude: 22.3039, longitude: 70.8022 },

  // North, Central & East India
  { placeName: 'New Delhi, Delhi, India', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { placeName: 'Noida, Uttar Pradesh, India', city: 'Noida', state: 'Uttar Pradesh', country: 'India', latitude: 28.5355, longitude: 77.3910 },
  { placeName: 'Gurugram (Gurgaon), Haryana, India', city: 'Gurugram', state: 'Haryana', country: 'India', latitude: 28.4595, longitude: 77.0266 },
  { placeName: 'Jaipur, Rajasthan, India', city: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873 },
  { placeName: 'Jodhpur, Rajasthan, India', city: 'Jodhpur', state: 'Rajasthan', country: 'India', latitude: 26.2389, longitude: 73.0243 },
  { placeName: 'Udaipur, Rajasthan, India', city: 'Udaipur', state: 'Rajasthan', country: 'India', latitude: 24.5854, longitude: 73.7125 },
  { placeName: 'Lucknow, Uttar Pradesh, India', city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462 },
  { placeName: 'Kanpur, Uttar Pradesh, India', city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', latitude: 26.4499, longitude: 80.3319 },
  { placeName: 'Varanasi (Kashi), Uttar Pradesh, India', city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739 },
  { placeName: 'Agra, Uttar Pradesh, India', city: 'Agra', state: 'Uttar Pradesh', country: 'India', latitude: 27.1767, longitude: 78.0081 },
  { placeName: 'Kolkata, West Bengal, India', city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639 },
  { placeName: 'Patna, Bihar, India', city: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376 },
  { placeName: 'Bhubaneswar, Odisha, India', city: 'Bhubaneswar', state: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245 },
  { placeName: 'Ranchi, Jharkhand, India', city: 'Ranchi', state: 'Jharkhand', country: 'India', latitude: 23.3441, longitude: 85.3096 },
  { placeName: 'Chandigarh, India', city: 'Chandigarh', state: 'Chandigarh', country: 'India', latitude: 30.7333, longitude: 76.7794 },
  { placeName: 'Amritsar, Punjab, India', city: 'Amritsar', state: 'Punjab', country: 'India', latitude: 31.6340, longitude: 74.8723 },
  { placeName: 'Bhopal, Madhya Pradesh, India', city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126 },
  { placeName: 'Indore, Madhya Pradesh, India', city: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577 },
  { placeName: 'Guwahati, Assam, India', city: 'Guwahati', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362 },

  // International Metropolitan Centers
  { placeName: 'London, Greater London, United Kingdom', city: 'London', state: 'Greater London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { placeName: 'New York City, New York, United States', city: 'New York', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { placeName: 'San Francisco, California, United States', city: 'San Francisco', state: 'California', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { placeName: 'Los Angeles, California, United States', city: 'Los Angeles', state: 'California', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { placeName: 'Chicago, Illinois, United States', city: 'Chicago', state: 'Illinois', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  { placeName: 'Dallas / Fort Worth, Texas, United States', city: 'Dallas', state: 'Texas', country: 'United States', latitude: 32.7767, longitude: -96.7970 },
  { placeName: 'Austin, Texas, United States', city: 'Austin', state: 'Texas', country: 'United States', latitude: 30.2672, longitude: -97.7431 },
  { placeName: 'Toronto, Ontario, Canada', city: 'Toronto', state: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { placeName: 'Vancouver, British Columbia, Canada', city: 'Vancouver', state: 'British Columbia', country: 'Canada', latitude: 49.2827, longitude: -123.1207 },
  { placeName: 'Singapore', city: 'Singapore', state: 'Central', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { placeName: 'Kuala Lumpur, Malaysia', city: 'Kuala Lumpur', state: 'Federal Territory', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869 },
  { placeName: 'Dubai, United Arab Emirates', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { placeName: 'Abu Dhabi, United Arab Emirates', city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773 },
  { placeName: 'Sydney, New South Wales, Australia', city: 'Sydney', state: 'New South Wales', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { placeName: 'Melbourne, Victoria, Australia', city: 'Melbourne', state: 'Victoria', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
  { placeName: 'Tokyo, Japan', city: 'Tokyo', state: 'Kanto', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { placeName: 'Paris, Île-de-France, France', city: 'Paris', state: 'Île-de-France', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { placeName: 'Berlin, Germany', city: 'Berlin', state: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 }
];

export const locationService = {
  // 1. Search built-in instant database
  searchLocal(query: string): LocationResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return POPULAR_LOCATIONS.filter(
      loc =>
        loc.city.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q) ||
        loc.placeName.toLowerCase().includes(q)
    ).slice(0, 8);
  },

  // 2. Search OpenStreetMap Nominatim for any global city/town/village
  async searchGlobal(query: string): Promise<LocationResult[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    // First check local matches
    const localMatches = this.searchLocal(q);
    if (localMatches.length >= 4) {
      return localMatches;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
        q
      )}&limit=6`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      if (!response.ok) {
        return localMatches;
      }
      const data = await response.json();

      const globalResults: LocationResult[] = (data || []).map((item: any) => {
        const addr = item.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          item.name ||
          q;
        const state = addr.state || addr.region || addr.province || '';
        const country = addr.country || '';

        return {
          placeName: item.display_name,
          city: city,
          state: state || city,
          country: country,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon)
        };
      });

      // Combine with local matches without duplicating
      const combined = [...localMatches];
      for (const res of globalResults) {
        if (!combined.some(c => Math.abs(c.latitude - res.latitude) < 0.05 && Math.abs(c.longitude - res.longitude) < 0.05)) {
          combined.push(res);
        }
      }
      return combined.slice(0, 8);
    } catch (e) {
      console.warn('Nominatim geocode failed, returning local fallback:', e);
      return localMatches;
    }
  },

  // 3. Browser GPS Geolocation helper
  async getCurrentGPS(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // Reverse geocode to find city and state
            const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
            const res = await fetch(revUrl, {
              headers: { 'Accept-Language': 'en' }
            });
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const city = addr.city || addr.town || addr.village || addr.county || 'Current Location';
              const state = addr.state || addr.region || '';
              const country = addr.country || '';
              resolve({
                placeName: data.display_name || `${city}, ${state}`,
                city,
                state: state || city,
                country,
                latitude: Math.round(lat * 10000) / 10000,
                longitude: Math.round(lon * 10000) / 10000
              });
              return;
            }
          } catch (e) {
            console.warn('Reverse geocode failed:', e);
          }

          // Fallback if reverse geocode fails
          resolve({
            placeName: `GPS Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            city: 'My Location',
            state: 'Detected via GPS',
            country: '',
            latitude: Math.round(lat * 10000) / 10000,
            longitude: Math.round(lon * 10000) / 10000
          });
        },
        (error) => {
          let msg = 'Unable to retrieve location';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please select your city from the list or search bar.';
          }
          reject(new Error(msg));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }
};
