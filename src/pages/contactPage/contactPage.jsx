import React from "react";
import "./contactPageStyle.css";
import Input from "../../components/input/input";
import {
	FaFacebookF,
	FaInstagram,
	FaStackOverflow,
	FaTwitter,
    FaGithub
} from "react-icons/fa";

const ContactPage = () => {
	const handleSubmit = (event) => {
		event.preventDefault();
	};

	const contactInfoItem = (line1, line2, socialLinks = false) => {
		return (
			<div className="contact-info-item">
				<h3>{line1 || ""}</h3>

				{!socialLinks ? (
					<p>{line2 || ""}</p>
				) : (
					<div className="social-links">
						<a href="#" target="_blank">
							<FaFacebookF size={20}/>
						</a>
						<a href="#" target="_blank">
							<FaInstagram size={20}/>
						</a>
						<a href="#" target="_blank">
							<FaTwitter size={20}/>
						</a>
						<a href="#" target="_blank">
							<FaStackOverflow size={20}/>
						</a>
						<a href="#" target="_blank">
							<FaGithub size={20}/>
						</a>
					</div>
				)}
			</div>
		);
	};

	return (
		<section className="contact-section glass-page">
			<div className="contact-container">
				<div className="row">
					<div className="contact-title">
						<h2>Contact Me</h2>
					</div>
				</div>
				<div className="row">
					<div className="contact-form">
						<form onSubmit={handleSubmit}>
							<div className="row">
								<Input type="text" placeholder="Name" required />
								<Input type="text" placeholder="Email" required />
								<Input type="text" placeholder="Subject" required />
								<Input type="textArea" placeholder="Message" required />
								<div className="submit-btn">
									<button type="submit" className="btn">
										Send Message
									</button>
								</div>
							</div>
						</form>
					</div>
					<div className="contact-info">
						{contactInfoItem("Email", "manish.agrawal.np@gmail.com")}
						{contactInfoItem("Phone", "+977-9*07000***")}
						{contactInfoItem("Follow", "", true)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default ContactPage;
