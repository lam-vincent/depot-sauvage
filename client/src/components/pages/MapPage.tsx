import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import parisMapImage from "../../assets/paris-map.jpg";
import clickPinIcon from "../../assets/yellow-pin.svg";
import reportedPinIcon from "../../assets/red-pin.svg";
import resolvedPinIcon from "../../assets/green-pin.svg";
import Incident from "../../types/Incident";
import IncidentCard from "../common/IncidentCard";

const MapPage: React.FC = () => {
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [clickedIncident, setClickedIncident] = useState<Incident | null>(null);
  const [imageSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 899,
  });
  const navigate = useNavigate();

  const refreshIncidents = () => {
    setRefreshCounter((prevCounter) => prevCounter + 1);
  };

  const fetchIncidents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/incidents");
      setIncidents(response.data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [refreshCounter, incidents]);

  const parseCoordinates = (coordinates: string): { x: number; y: number } => {
    const [xStr, yStr] = coordinates
      .replace('"(', "")
      .replace(')"', "")
      .split(",");
    const x = parseFloat(xStr.trim());
    const y = parseFloat(yStr.trim());
    return { x, y };
  };

  const handleMouseEvent = (event: React.MouseEvent<HTMLImageElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    const posX = (clientX - left) / width;
    const posY = (clientY - top) / height;

    const imageX = posX * currentTarget.naturalWidth;
    const imageY = posY * currentTarget.naturalHeight;

    setClickPosition({ x: imageX, y: imageY });
    setClickedIncident(null);
  };

  const handlePinClick = (incident: Incident) => {
    setClickedIncident(incident);
  };

  const handleReportButtonClick = () => {
    navigate("/report", { state: { clickPosition } });
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (filter === "reported") {
      return incident.status === "REPORTED";
    } else if (filter === "resolved") {
      return incident.status === "RESOLVED";
    } else {
      return true;
    }
  });

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Paris Map</h1>
      <div className="flex mb-4 space-x-4">
        <button
          className={`${
            filter === "all"
              ? "bg-gradient-to-l from-green-500 to-green-700"
              : "bg-gray-300"
          } hover:from-green-700 hover:to-green-900 text-white font-bold py-2 px-4 rounded`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`${
            filter === "reported"
              ? "bg-gradient-to-l from-green-500 to-green-700"
              : "bg-gray-300"
          } hover:from-green-700 hover:to-green-900 text-white font-bold py-2 px-4 rounded`}
          onClick={() => setFilter("reported")}
        >
          Reported
        </button>
        <button
          className={`${
            filter === "resolved"
              ? "bg-gradient-to-l from-green-500 to-green-700"
              : "bg-gray-300"
          } hover:from-green-700 hover:to-green-900 text-white font-bold py-2 px-4 rounded`}
          onClick={() => setFilter("resolved")}
        >
          Resolved
        </button>
      </div>
      <div className="mb-2 text-green-700">
        <strong>Click Position:</strong> ({clickPosition.x.toFixed(2)},
        {clickPosition.y.toFixed(2)})
      </div>
      <div
        className="relative"
        style={{ width: "100%", height: "auto", position: "relative" }}
      >
        <img
          src={parisMapImage}
          alt="Paris Map"
          className="w-full rounded-lg cursor-pointer"
          onClick={handleMouseEvent}
          style={{ display: "block" }}
        />
        {filteredIncidents.map((incident) => {
          const { id, coordinates, status } = incident;
          const { x, y } = parseCoordinates(JSON.stringify(coordinates));
          const pinIconSrc =
            status === "REPORTED" ? reportedPinIcon : resolvedPinIcon;

          return (
            <img
              key={id}
              src={pinIconSrc}
              alt={
                status === "REPORTED"
                  ? "Reported Incident Pin"
                  : "Resolved Incident Pin"
              }
              className="absolute"
              style={{
                left: `${(x / imageSize.width) * 100}%`,
                top: `${(y / imageSize.height) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid black",
              }}
              onClick={() => handlePinClick(incident)}
            />
          );
        })}
        {/* Render pin for clicked position */}
        <img
          src={clickPinIcon}
          alt="Click Pin"
          className="absolute"
          style={{
            left: `${(clickPosition.x / imageSize.width) * 100}%`,
            top: `${(clickPosition.y / imageSize.height) * 100}%`,
            transform: "translate(-50%, -50%)",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "2px solid black",
          }}
        />
        {/* Render IncidentCard when hovering over pin */}
        {clickedIncident && (
          <div
            className="absolute rounded"
            style={{
              left: `${50}%`,
              top: `${50}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => setClickedIncident(null)}
          >
            <IncidentCard
              key={clickedIncident.id}
              incidentId={clickedIncident.id}
              onIncidentChange={refreshIncidents}
            />
          </div>
        )}
      </div>
      <button
        className="mt-4 text-white font-medium py-3 px-8 font-sans bg-gradient-to-l from-green-500 to-green-700 rounded hover:from-green-700 hover:to-green-900"
        onClick={handleReportButtonClick}
      >
        Go to Report Page
      </button>
    </div>
  );
};

export default MapPage;
