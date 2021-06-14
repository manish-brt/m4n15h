import React from "react";
import "./portfolioPopupStyle.css";
import { FaTimes } from "react-icons/fa";

const PortfolioPopup = ({ closePopup, open }) => {
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
							<img src="img/univox-thumb.webp" />
						</div>
						<h3>Univox Community</h3>
					</div>

					<div className="pp-body">
						<div className="desc">
							<p>
								Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ipsa
								sapiente maiores ut, saepe facere officiis.
							</p>
						</div>
						<div className="general-info">
							<ul>
								<li>
									Created - <span>4 Dec 2019</span>
								</li>
								<li>
									technologies user - <span>Html, Css, Angular, Ionic</span>
								</li>
								<li>
									Role - <span>Mobile Applicaion (iOS and Android)</span>
								</li>
								<li>
									View online -{" "}
									<span>
										<a href="#" target="_blank">
											www.univoxcommunity.com
										</a>
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
