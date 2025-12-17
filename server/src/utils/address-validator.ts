import axios from "axios";

interface ZipResponse {
  places: { "place name": string; state: string }[];
}

const normalizeString = (str: string): { standard: string; noSpace: string } => {
  const trimmed = str.trim().replace(/\s+/g, " ");
  const noSpace = trimmed.replace(/\s/g, "");
  return { standard: trimmed.toLowerCase(), noSpace: noSpace.toLowerCase() };
};

export const validateAddress = async (
  state: string,
  city: string,
  zipCode: string
): Promise<string | boolean> => {
  try {
    const normalizedCity = normalizeString(city);
    const normalizedState = normalizeString(state);

    const response = await axios.get<ZipResponse>(`https://api.zippopotam.us/us/${zipCode}`);

    if (!response.data.places || response.data.places.length === 0) {
      return "Invalid ZIP code.";
    }

    // Normalize city/state in API response
    const validCity = response.data.places.some((place) => {
      const apiCity = normalizeString(place["place name"]);
      return (
        apiCity.standard === normalizedCity.standard || apiCity.noSpace === normalizedCity.noSpace
      );
    });

    const validState = response.data.places.some(
      (place) => normalizeString(place.state).standard === normalizedState.standard
    );

    if (!validCity) {
      return "City and ZIP code do not match.";
    }

    return validState ? true : "State and ZIP code do not match.";
  } catch (error) {
    return "Error validating address.";
  }
};
