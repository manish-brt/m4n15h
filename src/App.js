import logo from "./logo.svg";
import "./App.css";
import Header from "./components/header/header";
import HomePage from "./pages/homePage/homePage";
import AboutPage from "./pages/aboutPage/aboutPage";
import PortFolioPage from "./pages/portfolioPage/portfolioPage";
import ContactPage from "./pages/contactPage/contactPage";
import React, { useState } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	useLocation,
} from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import BgCirclesAnim from "./components/fun/bgCircles";

function App() {
	const [navMenuVisible, toggleNavMenu] = useState(false);
	let location = useLocation;

	return (
		<>
			<BgCirclesAnim />
			<div className="app">
				<TransitionGroup>
					<Router>
						<Header
							onNavMenuToggle={(state) => {
								toggleNavMenu(state);
							}}
						/>
						{!false && (
							<CSSTransition
								key={location.key}
								classNames="fade"
								timeout={5000}
							>
								<Switch>
									<Route exact path="/">
										<HomePage />
									</Route>

									<Route exact path="/home">
										<HomePage />
									</Route>

									<Route exact path="/portfolio">
										<PortFolioPage />
									</Route>

									<Route exact path="/about">
										<AboutPage />
									</Route>

									<Route exact path="/contact">
										<ContactPage />
									</Route>
								</Switch>
							</CSSTransition>
						)}
					</Router>
				</TransitionGroup>
			</div>
		</>
	);
}

export default App;
