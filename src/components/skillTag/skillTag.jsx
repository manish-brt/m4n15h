import React from "react";
import "./skillStyle.css";

const SkillTag = ({ name, mStyle, mClass }) => {
	return (
		<div href="#" className={`item ${mClass}`} style={mStyle}>
			{name || ""}
		</div>
	);
};

export default SkillTag;
