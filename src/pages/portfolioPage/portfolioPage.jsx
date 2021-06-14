import React, { useEffect, useState } from "react";
import "./portfolioStyle.css";
import PortfolioItem from "../../components/portfolioItem/portfolioItem";
import PortfolioPopup from "../../components/portfolioPopup/portfolioPopup";

const PortFolioPage = () => {
	const [showPopup, togglePopupVisibility] = useState(false);

	const data = [{}, {}, {}, {}, {}, {}, {}, {}, {}];

	return (
		<>
			{showPopup ? (
				<PortfolioPopup closePopup={() => togglePopupVisibility(false)} open />
			):
			<section className="portfolio-section glass-page">
				<div className="container">
					<div className="row">
						<div className="portfolio-title">
							<h2>Recent Works</h2>
						</div>
						<div className="row">
							{data &&
								data.map(() => (
									<PortfolioItem
										showProjPopup={(state) => {
											togglePopupVisibility(state);
										}}
									/>
								))}
						</div>
					</div>
				</div>
			</section>}
		</>
	);
};

export default PortFolioPage;
