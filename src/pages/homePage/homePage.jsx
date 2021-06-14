import React from "react";
import "./homeStyle.css";
import Button from "../../components/btn/btn";
const HomePage = () => {
	return (
		// <div className="main">
			<section className="home-section glass-page">
				<div className="container">
					<div className="row">
						<div className="home-text">
							<p>Hello I, m</p>
							<h1>Manish Agrawal</h1>
							<h2>Software Developer</h2>
							<Button name={"more about me"} link="/about"/>
							<Button name={"portfolio"} link="/portfolio" mStyle={{marginLeft: "12px"}}/>

							{/* <a href="#" className="btn">
								more about me
							</a>
							<a href="#" className="btn">
								portfolio
							</a> */}
						</div>
						<div className="home-img">
							<div className="img-box">
								<img src="img/manish.png" alt="profileImage" />
							</div>
						</div>
					</div>
				</div>
			</section>
		// </div>
	);
};

export default HomePage;
