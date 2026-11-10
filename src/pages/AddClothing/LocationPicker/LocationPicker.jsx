import { useState } from "react";
import { State, City } from "country-state-city";
import "./LocationPicker.css";

function LocationPicker({ value, onChange }) {
    const [detecting, setDetecting] = useState(false);
    const [detected, setDetected] = useState(false);

    const states = State.getStatesOfCountry("IN");

    const selectedState = states.find(
        item => item.name === value.state
    );

    const cities = selectedState
        ? City.getCitiesOfState("IN", selectedState.isoCode)
        : [];

    const update = (name, val) => {
        onChange({
            ...value,
            [name]: val
        });

        setDetected(false);
    };

    const stateChange = e => {
        const state = states.find(
            item => item.isoCode === e.target.value
        );

        onChange({
            ...value,
            state: state?.name || "",
            city: ""
        });

        setDetected(false);
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported.");
            return;
        }

        setDetecting(true);
        setDetected(false);

        navigator.geolocation.getCurrentPosition(
            async position => {
                try {
                    const { latitude, longitude } =
                        position.coords;

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
                    );

                    const data = await response.json();
                    const address = data.address || {};

                    const country =
                        address.country || "India";

                    const state =
                        address.state || "";

                    const city =
                        address.city ||
                        address.town ||
                        address.village ||
                        address.municipality ||
                        "";

                    onChange({
                        country,
                        state,
                        city
                    });

                    setDetected(true);

                } catch (error) {
                    console.log(
                        "LOCATION ERROR:",
                        error
                    );

                    alert(
                        "Unable to get city and state."
                    );
                } finally {
                    setDetecting(false);
                }
            },
            error => {
                console.log(
                    "GEOLOCATION ERROR:",
                    error
                );

                setDetecting(false);

                if (error.code === 1) {
                    alert(
                        "Please allow location permission."
                    );
                } else {
                    alert(
                        "Unable to detect your location."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <div className="location-picker">

            <div className="location-field">

                <label>
                    Country <span>*</span>
                </label>

                <input
                    type="text"
                    value={value.country || ""}
                    onChange={e =>
                        update(
                            "country",
                            e.target.value
                        )
                    }
                    placeholder="Enter country"
                />

            </div>

            <div className="location-field">

                <label>
                    State <span>*</span>
                </label>

                <select
                    value={
                        selectedState?.isoCode || ""
                    }
                    onChange={stateChange}
                >

                    <option value="">
                        Select state
                    </option>

                    {states.map(state => (
                        <option
                            key={state.isoCode}
                            value={state.isoCode}
                        >
                            {state.name}
                        </option>
                    ))}

                </select>

            </div>

            <div className="location-field">

                <label>
                    City / Town <span>*</span>
                </label>

                <select
                    value={value.city || ""}
                    onChange={e =>
                        update(
                            "city",
                            e.target.value
                        )
                    }
                    disabled={!value.state}
                >

                    <option value="">
                        Select city / town
                    </option>

                    {cities.map(city => (
                        <option
                            key={`${city.name}-${city.stateCode}`}
                            value={city.name}
                        >
                            {city.name}
                        </option>
                    ))}

                </select>

            </div>

            <div className="current-location">

                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={detecting}
                >
                    {detecting
                        ? "📍 Detecting..."
                        : "📍 Get Current Location"}
                </button>

                {detected && (
                    <small>
                        ✓ Location detected
                    </small>
                )}

            </div>

        </div>
    );
}

export default LocationPicker;