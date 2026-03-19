import React from 'react';

const About = () => {
    return (
        <div className="p-6 w-full bg-gray-100 flex flex-col items-center justify-center">
            <h1>About This Application</h1>
            <p>This application is built using React and React Router for client-side routing.</p>
            <p>It features a simple navigation bar and three main pages: Home, About, and Contact.</p>
        </div>
    );
};

export default About;