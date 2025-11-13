import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mic, Square } from 'lucide-react';

const API_BASE = 'https://survey-backend-189731478679.europe-west1.run.app/api';
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function SurveyApp() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSurveys();
    }
  }, [user]);

  const fetchSurveys = async () => {
    try {
      const response = await fetch(`${API_BASE}/surveys`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSurveys(Array.isArray(data) ? data : []);
      setApiError(false);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setApiError(true);
      setSurveys([]);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setView('home');
        setApiError(false);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(true);
      alert('Cannot connect to server. Please ensure the backend is running.');
    }
  };

  const register = async (username, email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/auth/create-admin' : '/auth/register';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        alert('Registration successful! Please login.');
        setView('login');
        setApiError(false);
      } else {
        const error = await response.text();
        alert(error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(true);
      alert('Cannot connect to server. Please ensure the backend is running.');
    }
  };

  const createSurvey = async (surveyData) => {
    try {
      const response = await fetch(`${API_BASE}/surveys?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });
      if (response.ok) {
        await fetchSurveys();
        setView('home');
        alert('Survey created successfully!');
      } else {
        alert('Only admins can create surveys');
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      alert('Failed to create survey. Check server connection.');
    }
  };

  const submitResponse = async (surveyId, responseData) => {
    try {
      const response = await fetch(`${API_BASE}/surveys/${surveyId}/responses?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData),
      });
      if (response.ok) {
        alert('Survey submitted successfully!');
        setView('home');
        setCurrentSurvey(null);
      } else {
        alert('Failed to submit survey');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit survey. Check server connection.');
    }
  };

  const fetchReport = async (surveyId) => {
    try {
      const response = await fetch(`${API_BASE}/surveys/${surveyId}/report?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setView('report');
      } else {
        alert('Only admins can view reports');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch report. Check server connection.');
    }
  };

  const logout = () => {
    setUser(null);
    setView('login');
    setSurveys([]);
    setReportData(null);
    setCurrentSurvey(null);
  };

  if (!user) {
    return <AuthView login={login} register={register} view={view} setView={setView} apiError={apiError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">Survey Manager</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user.username} ({user.role})
              </p>
            </div>
            <div className="space-x-4">
              <button 
                onClick={() => { setView('home'); setCurrentSurvey(null); setReportData(null); }} 
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                Home
              </button>
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => setView('create')} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Create Survey
                </button>
              )}
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {apiError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm">Cannot connect to the backend server at {API_BASE}. Please ensure it is running.</p>
          </div>
        )}
        
        {view === 'home' && (
          <HomeView 
            surveys={surveys} 
            setCurrentSurvey={setCurrentSurvey} 
            setView={setView} 
            fetchReport={fetchReport} 
            isAdmin={user.role === 'ADMIN'} 
          />
        )}
        {view === 'create' && user.role === 'ADMIN' && (
          <CreateSurveyView createSurvey={createSurvey} setView={setView} />
        )}
        {view === 'take' && currentSurvey && (
          <TakeSurveyView survey={currentSurvey} submitResponse={submitResponse} />
        )}
        {view === 'report' && reportData && user.role === 'ADMIN' && (
          <ReportView report={reportData} setView={setView} />
        )}
      </main>
    </div>
  );
}

function AuthView({ login, register, view, setView, apiError }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please fill in all fields');
      return;
    }
    login(username, password);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    register(username, email, password, isAdmin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Survey Manager</h1>
        
        {apiError && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
            Backend server not connected. Using demo mode.
          </div>
        )}
        
        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Login</h2>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
            <button 
              type="submit"
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Login
            </button>
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setView('register')} 
                className="text-indigo-600 hover:underline"
              >
                Register
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Register</h2>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={(e) => setIsAdmin(e.target.checked)} 
                className="w-4 h-4 text-indigo-600 rounded" 
              />
              <span className="text-gray-700">Register as Admin</span>
            </label>
            <button 
              type="submit"
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Register
            </button>
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => setView('login')} 
                className="text-indigo-600 hover:underline"
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function HomeView({ surveys, setCurrentSurvey, setView, fetchReport, isAdmin }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Available Surveys</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <div key={survey.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{survey.title}</h3>
            <p className="text-gray-600 mb-4">{survey.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              {survey.questions?.length || 0} questions
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => { 
                  setCurrentSurvey(survey); 
                  setView('take'); 
                }} 
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Take Survey
              </button>
              {isAdmin && (
                <button 
                  onClick={() => fetchReport(survey.id)} 
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Report
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {surveys.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-lg">No surveys available.</p>
          <p className="text-gray-400 text-sm mt-2">Connect to the backend to see surveys.</p>
        </div>
      )}
    </div>
  );
}

function AudioRecorder({ onRecordingComplete, questionText }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          onRecordingComplete(reader.result, 'audio/webm');
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        {!isRecording ? (
          <button 
            type="button"
            onClick={startRecording} 
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Mic size={20} />
            Start Recording
          </button>
        ) : (
          <button 
            type="button"
            onClick={stopRecording} 
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <Square size={20} />
            Stop Recording
          </button>
        )}
        {isRecording && (
          <span className="text-red-600 font-semibold animate-pulse">Recording...</span>
        )}
      </div>
      
      {audioURL && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Your recording:</p>
          <audio src={audioURL} controls className="w-full" />
        </div>
      )}
    </div>
  );
}

function CreateSurveyView({ createSurvey, setView }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', type: 'TEXT', options: '', audioData: null, audioMimeType: null }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { questionText: '', type: 'TEXT', options: '', audioData: null, audioMimeType: null }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateQuestionAudio = (index, audioData, mimeType) => {
    const newQuestions = [...questions];
    newQuestions[index].audioData = audioData;
    newQuestions[index].audioMimeType = mimeType;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      alert('Survey must have at least one question');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a survey title');
      return;
    }
    if (questions.some(q => !q.questionText.trim())) {
      alert('Please fill in all question texts');
      return;
    }
    if (questions.some(q => q.type === 'MULTIPLE_CHOICE' && !q.options.trim())) {
      alert('Please provide options for all multiple choice questions');
      return;
    }
    createSurvey({ title, description, questions });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Survey</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Survey Title *
          </label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            placeholder="Enter survey title" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={3} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            placeholder="Enter survey description" 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
            <button 
              type="button"
              onClick={addQuestion} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Add Question
            </button>
          </div>

          {questions.map((q, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                {questions.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeQuestion(index)} 
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <input 
                type="text" 
                value={q.questionText} 
                onChange={(e) => updateQuestion(index, 'questionText', e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                placeholder="Enter question" 
                required
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <select 
                    value={q.type} 
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="TEXT">Text</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="RATING">Rating</option>
                    <option value="YES_NO">Yes/No</option>
                    <option value="AUDIO">Audio Response</option>
                  </select>
                </div>

                {q.type === 'MULTIPLE_CHOICE' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Options (comma-separated) *
                    </label>
                    <input 
                      type="text" 
                      value={q.options} 
                      onChange={(e) => updateQuestion(index, 'options', e.target.value)} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      placeholder="Option1,Option2,Option3" 
                      required={q.type === 'MULTIPLE_CHOICE'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Optional: Add audio to question
                  </label>
                  <AudioRecorder 
                    questionText={q.questionText}
                    onRecordingComplete={(data, mime) => updateQuestionAudio(index, data, mime)}
                  />
                  {q.audioData && (
                    <p className="text-sm text-green-600 mt-2">✓ Audio added</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit"
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Create Survey
          </button>
          <button 
            type="button"
            onClick={() => setView('home')} 
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function TakeSurveyView({ survey, submitResponse }) {
  const [answers, setAnswers] = useState({});

  const updateAnswer = (questionId, value, mimeType = null) => {
    setAnswers({ 
      ...answers, 
      [questionId]: { 
        answerText: value, 
        audioMimeType: mimeType 
      } 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const unanswered = survey.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert('Please answer all questions. Missing ' + unanswered.length + ' answer(s).');
      return;
    }

    const responseData = {
      answers: Object.entries(answers).map(([questionId, data]) => ({
        questionId: parseInt(questionId),
        answerText: String(data.answerText),
        audioMimeType: data.audioMimeType
      }))
    };

    submitResponse(survey.id, responseData);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{survey.title}</h2>
      <p className="text-gray-600 mb-6">{survey.description}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.questions && survey.questions.map((question, index) => (
          <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-800 mb-3">
              {index + 1}. {question.questionText}
            </label>

            {question.audioData && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">Listen to the question:</p>
                <audio src={question.audioData} controls className="w-full" />
              </div>
            )}

            {question.type === 'TEXT' && (
              <textarea 
                value={answers[question.id] && answers[question.id].answerText ? answers[question.id].answerText : ''} 
                onChange={(e) => updateAnswer(question.id, e.target.value)} 
                rows={3} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                placeholder="Your answer" 
                required
              />
            )}

            {question.type === 'MULTIPLE_CHOICE' && question.options && (
              <div className="space-y-2">
                {question.options.split(',').map((option) => (
                  <label 
                    key={option} 
                    className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input 
                      type="radio" 
                      name={'question-' + question.id} 
                      value={option.trim()} 
                      checked={answers[question.id] && answers[question.id].answerText === option.trim()} 
                      onChange={(e) => updateAnswer(question.id, e.target.value)} 
                      className="mr-3" 
                      required
                    />
                    <span>{option.trim()}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'RATING' && (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button 
                    key={rating}
                    type="button"
                    onClick={() => updateAnswer(question.id, rating)} 
                    className={'px-4 py-2 rounded-lg transition ' + (answers[question.id] && answers[question.id].answerText === rating ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300')}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'AUDIO' && (
              <AudioRecorder 
                questionText={question.questionText}
                onRecordingComplete={(data, mime) => updateAnswer(question.id, data, mime)}
              />
            )}
          </div>
        ))}

        <button 
          type="submit"
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
        >
          Submit Survey
        </button>
      </form>
    </div>
  );
}

function ReportView({ report, setView }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{report.surveyTitle}</h2>
            <p className="text-gray-600 mt-2">Total Responses: {report.totalResponses}</p>
          </div>
          <button 
            onClick={() => setView('home')} 
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Home
          </button>
        </div>

        <div className="space-y-8">
          {report.questionReports.map((qReport, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {index + 1}. {qReport.questionText}
              </h3>

              {(qReport.questionType === 'MULTIPLE_CHOICE' || qReport.questionType === 'YES_NO' || qReport.questionType === 'RATING') && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(qReport.answerCounts).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="Responses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie 
                          data={Object.entries(qReport.answerCounts).map(([name, value]) => ({ name, value }))} 
                          cx="50%" 
                          cy="50%" 
                          labelLine={false} 
                          label={({ name, percent }) => name + ': ' + (percent * 100).toFixed(0) + '%'} 
                          outerRadius={100} 
                          fill="#8884d8" 
                          dataKey="value"
                        >
                          {Object.entries(qReport.answerCounts).map((entry, idx) => (
                            <Cell key={'cell-' + idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {qReport.questionType === 'TEXT' && (
                <div className="space-y-2">
                  {qReport.allAnswers && qReport.allAnswers.map((answer, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                      <p className="text-gray-700">{answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {qReport.questionType === 'AUDIO' && qReport.audioAnswers && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Audio Responses ({qReport.audioAnswers.length})</p>
                  {qReport.audioAnswers.map((audioData, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Response {idx + 1}</p>
                      <audio src={audioData} controls className="w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
