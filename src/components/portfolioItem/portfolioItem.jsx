import React from "react";
import "./portfolioItemStyle.css";

const PortfolioItem = ({showProjPopup}) => {
	return (
		<div className={`portfolio-item`}>
			<div className="portfolio-item-thumbnail">
				<img src="img/univox-thumb.webp" alt="" />
			</div>
			<h3 className="portfolio-item-title">Univox Community</h3>
			<button type="button" className="btn view-project-btn" onClick={()=> showProjPopup(true)} >
				View Project
			</button>
			<div className="portfolio-item-details">
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
	);
};

export default PortfolioItem;
