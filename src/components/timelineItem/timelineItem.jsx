import React from "react";
import "./timelineItemStyle.css";

const TimelineItem = ({ data }) => {
	return (
		<div className="timeline-item">
			{console.log("Yaha Aaya")}
			<span className="timeline-date">
				{(data && data.date) || "2014-2018"}
			</span>
			<h4>
				{(data && data.title) || "Bachelor of Technology"} -{" "}
				<span> {(data && data.title2) || "MNNIT Allabhad"} </span>
			</h4>
			<p>
				{(data && data.para) ||
					"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Exercitatio quasi cumque officiis tempore, modi possimus?"}
			</p>
		</div>
	);
};

export default TimelineItem;
