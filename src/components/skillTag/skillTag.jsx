import React from "react";
import "./skillStyle.css";

const SkillTag = ({name, mStyle}) => {
	return (
		<div href="#" className="item" style={mStyle}>
			{name || ""}
		</div>    
	);
};

export default SkillTag;
