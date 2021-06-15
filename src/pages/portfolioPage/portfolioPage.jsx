import React, { useEffect, useState } from "react";
import "./portfolioStyle.css";
import PortfolioItem from "../../components/portfolioItem/portfolioItem";
import PortfolioPopup from "../../components/portfolioPopup/portfolioPopup";

const PortFolioPage = () => {
	const [showPopup, togglePopupVisibility] = useState(false);
	const [selectedProj, setSelectedProj] = useState({});
	const [projectDataList, setProjectData] = useState([]);

	const projData = require("./../../data/portfolioData.json");

	useEffect(() => {
		if (projData) {
			setProjectData(projData);
		}
	}, [projData]);

	return (
		<>
			{showPopup ? (
				<PortfolioPopup
					data={selectedProj}
					closePopup={() => togglePopupVisibility(false)}
					open
				/>
			) : (
				<section className="portfolio-section glass-page">
					<div className="container">
						<div className="row">
							<div className="portfolio-title">
								<h2>Recent Works</h2>
							</div>
							<div className="row">
								{projectDataList &&
									projectDataList.map((item, idx) => (
										<PortfolioItem
											key={idx}
											item={item}
											showProjPopup={(state, data) => {
												setSelectedProj(data);
												togglePopupVisibility(state);
											}}
										/>
									))}
							</div>
						</div>
					</div>
				</section>
			)}
		</>
	);
};

export default PortFolioPage;
