import React from "react";
import { useLocation } from "react-router-dom";
import Form from "../common/Form";

const ReportPage: React.FC = () => {
  const location = useLocation();
  const clickPosition = (
    location.state as { clickPosition: { x: number; y: number } }
  )?.clickPosition || { x: 0, y: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      <Form initialPosition={clickPosition} />
    </div>
  );
};

export default ReportPage;
