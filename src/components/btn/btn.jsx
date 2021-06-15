import React from "react";
import "./btnStyle.css";

import { Link } from "react-router-dom";
import { FaGooglePlay, FaAppStore, FaDesktop } from "react-icons/fa";

const Button = ({ name, link, mStyle, mClass, icon }) => {
	const getIcon = (icon) => {
		if (icon === "google") {
			return <FaGooglePlay className="icon" />;
		} else if (icon === "apple") {
			return <FaAppStore className="icon" />;
		} else if (icon === "web") {
			return <FaDesktop className="icon" />;
		}

		return "";
	};

	return (
		<>
			{link && link.includes("http") ? (
				<a
					href={link && link}
					className={`btn ${mClass}`}
					style={mStyle}
					target="_blank"
				>
					{icon && getIcon(icon)} {name || ""}
				</a>
			) : (
				<Link to={link && link} className={`btn ${mClass}`} style={mStyle}>
					{icon && getIcon(icon)} {name || ""}
				</Link>
			)}
		</>
	);
};

export default Button;
