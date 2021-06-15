import React from "react";
import "./timelineItemStyle.css";

const TimelineItem = ({ data }) => {
	return (
		<div className="timeline-item">
			<span className="timeline-date">{(data && data.date) || ""}</span>
			<h4>
				{(data && data.title) || ""} 
				<br/>
				{/* {" -  "} */}
				<span> {(data && data.title2) || ""} </span>
			</h4>
			<p>{(data && data.para) || ""}</p>
		</div>
	);
};

export default TimelineItem;
