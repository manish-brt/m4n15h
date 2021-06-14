import React from "react";
import "./btnStyle.css";

import { Link } from "react-router-dom";

const Button = ({ name, link, mStyle }) => {
	return (
		<Link to={link || "#"} className="btn" style={mStyle}>
			{name || ""}
		</Link>
	);
};

export default Button;
