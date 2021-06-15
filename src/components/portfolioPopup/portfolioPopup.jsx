import React from "react";
import "./portfolioPopupStyle.css";
import { FaTimes } from "react-icons/fa";
import Button from "../btn/btn";
import SkillTag from "../skillTag/skillTag";

const PortfolioPopup = ({ closePopup, open, data }) => {
	return (
		<div className={`portfolio-popup ${open ? "open" : ""}`}>
			<div className="pp-inner">
				<div className="pp-content">
					<div className="pp-header">
						<button
							type="button"
							className="btn pp-close"
							onClick={() => closePopup()}
						>
							<FaTimes />
						</button>
						<div className="pp-thumbnail">
							
							<img
								alt={data && data.title}
								src={data.images[0] || ""}
								className={`${data.type === "mobile" ? "proj-img" : ""}`}
							/>
						</div>
						<h3>{data && data.title}</h3>
					</div>

					<div className="pp-body">
						<div className="desc">
							<p>{data && data.desc}</p>
						</div>
						<div className="general-info">
							<ul>
								<li>
									Created <span>{data && data.date}</span>
								</li>
								<li>
									Tech Stack
									<span className="tech-stack">
										{data &&
											data.tech &&
											data.tech.map((t) => (
												<SkillTag name={t} mClass="tech-item" />
											))}
									</span>
								</li>
								<li>
									Role <span>{data && data.role}</span>
								</li>
								<li>
									View online
									<span className="view-btns">
										{data && data.links.android && (
											<Button
												_blank
												mClass={"link-btn2"}
												name="Play Store"
												link={data.links.android}
												icon={"google"}
											/>
										)}
										{data && data.links.ios && (
											<Button
												_blank
												mClass={"link-btn2"}
												name="App Store"
												link={data.links.ios}
												icon={"apple"}
											/>
										)}
										{data && data.links.web && (
											<Button
												_blank
												mClass={"link-btn2"}
												name="Web App"
												link={data.links.web}
												icon={"web"}
											/>
										)}
										{/* <a href={data.links.android} target="_blank">
											{data && data.links.android}
										</a> */}
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PortfolioPopup;
