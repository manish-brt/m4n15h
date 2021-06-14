import React, { useEffect, useState } from "react";
import "./aboutStyle.css";
import Button from "../../components/btn/btn";
import SkillTag from "../../components/skillTag/skillTag";
import TimelineItem from "../../components/timelineItem/timelineItem";

const EduTab = "Education";
const ExpTab = "Experience";

const AboutPage = () => {
	const [activeTab, toggleTab] = useState({ EduTab });
	const [eduDataList, setEduData] = useState([]);
	const [expDataList, setExpData] = useState([]);

	const eduData = require("./../../data/eduData.json");
	const expData = require("./../../data/expData.json");

	useEffect(() => {
		if (eduData) {
			setEduData(eduData);
		}
	}, [eduData]);

	useEffect(() => {
		if (expData) {
			setExpData(expData);
		}
	}, [expData]);

	return (
		// <div className="main">
		<section className="about-section glass-page">
			<div className="container">
				<div className="row">
					<div className="about-title">
						<h2>About Me</h2>
					</div>
					<div className="row" style={{alignItems: "unset"}}>
						<div className="about-img">
							<div className="img-box">
								<img src={`img/manish.png`} alt="profileImage" />
							</div>
						</div>
						<div className="about-text">
							<p>
								Lorem Ipsum is simply dummy text of the printing and typesetting
								industry. Lorem Ipsum has been the industry's standard dummy
								text ever since the 1500s, when an unknown printer took a galley
								of type and scrambled it to make a type specimen book. It has
								survived not only five centuries, but also the leap into
								electronic typesetting, remaining essentially unchanged. It was
								popularised in the 1960s with the release of Letraset sheets
								containing Lorem Ipsum passages, and more recently with desktop
								publishing software like Aldus PageMaker including versions of
								Lorem Ipsum.
							</p>
							<h3>Skills</h3>
							<div className="skills">
								<SkillTag name="Android" />
								<SkillTag name="Ionic" />
								<SkillTag name="React Native" />
								<SkillTag name="Flutter" />
								<SkillTag name="Java" />
								<SkillTag name="Html" />
								<SkillTag name="Css" />
								<SkillTag name="Javascript" />
							</div>

							<div className="about-tabs">
								<button
									onClick={() => toggleTab(EduTab)}
									type="button"
									className={`tab-item  + ${
										activeTab === EduTab ? "active" : ""
									}`}
									data-target="#education"
								>
									Education
								</button>
								<button
									onClick={() => toggleTab(ExpTab)}
									type="button"
									className={`tab-item  + ${
										activeTab === ExpTab ? "active" : ""
									}`}
									data-target="#experience"
								>
									Experience
								</button>
							</div>

							{/* Education */}
							{activeTab == EduTab ? (
								<div className="tab-content" id="education">
									{/* {console.log("EduTab -" + JSON.stringify(edu))} */}
									<div className="timeline">
										{eduDataList.map((data, idx) => (
											<TimelineItem data={data} key={idx} />
										))}
									</div>
								</div>
							) : (
								<div className="tab-content" id="experience">
									<div className="timeline">
										{expDataList.map((data, idx) => (
											<TimelineItem key={idx} data={data} />
										))}
									</div>
								</div>
							)}

							<Button name={"Contact Me"} link="/contact"/>
						</div>
					</div>
				</div>
			</div>
		</section>
		// </div>
	);
};

export default AboutPage;
