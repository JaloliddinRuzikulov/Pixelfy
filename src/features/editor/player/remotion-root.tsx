import React from "react";
import { registerRoot } from "remotion";
import Composition from "./composition";

// Register the root component for Remotion CLI
export const RemotionRoot: React.FC = () => {
	return null; // This component is only used for registration
};

// Register compositions for Remotion to render
registerRoot(() => <RemotionRoot />);
