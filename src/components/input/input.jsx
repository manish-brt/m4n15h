import React from "react";
import "./inputStyle.css";

const Input = ({ type, placeholder, required, txtArea }) => {
	return (
		<div className="input-group">
			{type == "textArea" ? (
				<textarea
					placeholder={placeholder || ""}
					// id=""
					// cols="30"
					// rows="10"
					className="input-control"
					required
				/>
			) : (
				<input
					type={type || "text"}
					placeholder={placeholder || ""}
					className="input-control"
					required
				/>
			)}
		</div>
	);
};

export default Input;
