import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import your existing components
import AuthForm from './pages/AuthForm.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import RespondentDashboard from './pages/RespondentDashboard.jsx';
import SurveyBuilder from './pages/SurveyBuilder.jsx';
import TakeSurvey from './pages/TakeSurvey.jsx';
import SurveyResponsesAnalysis from './pages/SurveyResponsesAnalysis';
import PublicSurveyPage from './pages/PublicSurveyPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Import the new role-based signup components
import RoleSelectionPage from './pages/RoleSelectionPage.jsx';
import ClientSignupForm from './pages/ClientSignupForm.jsx';
import RespondentSignupForm from './pages/RespondentSignupForm.jsx';
import InstitutionSignupForm from './pages/InstitutionSignupForm.jsx';

// Import the new pages
import SurveyTemplatesPage from './pages/SurveyTemplatesPage.jsx';
import ChatFlowTemplates from './pages/ChatFlowTemplates.jsx';
import RespondentOnboardingSurvey from './pages/RespondentOnboardingSurvey.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PlatformPage from './pages/PlatformPage.jsx';
import ApproachPage from './pages/ApproachPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import CompanyPage from './pages/CompanyPage.jsx';
import TerriAISummarizePage from './pages/TerriAISummarizePage'; // <-- IMPORT

// Import the live conversation components
import LiveConversation from './pages/LiveConversation.jsx';
import RespondentView from './pages/RespondentView.jsx';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/approach" element={<ApproachPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/company" element={<CompanyPage />} />

            <Route path="/login" element={<AuthForm type="login" />} />

            {/* Registration Flow Routes */}
            <Route path="/register" element={<Navigate to="/register-role-select" replace />} />
            <Route path="/register-role-select" element={<RoleSelectionPage />} />
            <Route path="/register/client" element={<ClientSignupForm />} />
            <Route path="/register/respondent" element={<RespondentSignupForm />} />
            <Route path="/register/institution" element={<InstitutionSignupForm />} />

            {/* Publicly accessible pages for respondents */}
            <Route path="/public-survey/:publicShareId" element={<PublicSurveyPage />} />
            <Route path="/live-session/:sessionId" element={<RespondentView />} />


            {/* Client Protected Routes - All nested under ProtectedRoute */}
            <Route element={<ProtectedRoute allowedRoles={['client', 'institution_admin']} />}>
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/client/survey/new" element={<SurveyBuilder />} />
                <Route path="/client/survey/edit/:id" element={<SurveyBuilder />} />
                <Route path="/client/surveys/:surveyId/responses" element={<SurveyResponsesAnalysis />} />
                <Route path="/client/templates" element={<SurveyTemplatesPage />} />
                <Route path="/client/chat-flow-templates" element={<ChatFlowTemplates />} />
                <Route path="/client/live-conversation" element={<LiveConversation />} />
                {/* CORRECTED: Move the route here so it's protected for clients */}
                <Route path="/client/summarize" element={<TerriAISummarizePage />} />
            </Route>

            {/* Respondent Protected Routes - All nested under ProtectedRoute */}
            <Route element={<ProtectedRoute allowedRoles={['respondent']} />}>
                {/* Onboarding survey route - should be accessed if profile is incomplete */}
                <Route path="/respondent/onboarding-survey" element={<RespondentOnboardingSurvey />} />
                <Route path="/respondent/dashboard" element={<RespondentDashboard />} />
                <Route path="/respondent/take-survey/:id" element={<TakeSurvey />} />
            </Route>

            {/* Super Admin Protected Routes - For the application owner */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                <Route path="/admin/dashboard" element={<div>Super Admin Dashboard - To be built</div>} />
                {/* Add more admin-specific routes here */}
            </Route>


            {/* Fallback for unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;