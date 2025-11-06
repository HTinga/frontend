import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import nlp from 'compromise';
// Removed: import compromiseSentiment from '@compromise/sentiment';
import { Chatbot } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import io from 'socket.io-client';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Removed: nlp.extend(compromiseSentiment);

// Mock chatbot config (customize as needed)
const chatbotConfig = {
  initialMessages: [{ id: 1, message: 'Ask me about the survey insights!', type: 'bot' }],
  botName: 'JijiPoll Assistant'
};

const SurveyResponsesAnalysis = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analysisData, setAnalysisData] = useState({});
  const [summary, setSummary] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [filters, setFilters] = useState({ demographic: 'all', dateRange: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Corrected: Use import.meta.env for Vite environment variables
  const socket = io(import.meta.env.VITE_APP_API_URL);

  useEffect(() => {
    // --- Added check for surveyId ---
    if (!surveyId) {
      setError('Survey ID is missing from the URL. Please navigate from a valid survey link.');
      setLoading(false);
      return;
    }
    // --- End of added check ---

    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [surveyRes, responsesRes] = await Promise.all([
          API.get(`/client/surveys/${surveyId}`),
          API.get(`/client/surveys/${surveyId}/responses`)
        ]);
        setSurvey(surveyRes.data);
        setResponses(responsesRes.data);
        const processedData = processResponsesForAnalysis(surveyRes.data.questions, responsesRes.data);
        setAnalysisData(processedData);
        const summaryData = generateSummary(surveyRes.data, responsesRes.data);
        setSummary(summaryData);
      } catch (err) {
        console.error('Error fetching survey analysis data:', err);
        setError(err.response?.status === 404 ? 'Survey or responses not found.' : 'Failed to load survey analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();

    // Real-time response updates
    socket.on('newResponse', (newResponse) => {
      if (newResponse.surveyId === surveyId) {
        setResponses((prev) => [...prev, newResponse]);
        // Ensure survey is not null before processing
        if (survey) {
          setAnalysisData((prev) => processResponsesForAnalysis(survey.questions, [...responses, newResponse]));
          setSummary(generateSummary(survey, [...responses, newResponse]));
        }
      }
    });

    return () => socket.off('newResponse');
  }, [surveyId, survey, responses]); // Added survey and responses to dependency array for correct updates

  // Process responses for analysis
  const processResponsesForAnalysis = (questions, responses) => {
    const data = {};
    questions.forEach((question) => {
      if (['multiple_choice', 'checkbox'].includes(question.questionType)) {
        data[question._id] = {
          questionText: question.questionText,
          type: question.questionType,
          options: question.options.map((opt) => ({ name: opt.text, count: 0 }))
        };
      } else if (question.questionType === 'rating' || question.questionType === 'nps') {
        data[question._id] = {
          questionText: question.questionText,
          type: question.questionType,
          ratings: {},
          average: 0
        };
      } else if (['open-ended', 'conversational'].includes(question.questionType)) {
        data[question._id] = {
          questionText: question.questionText,
          type: question.questionType,
          responses: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          themes: {}
        };
      }
    });

    responses.forEach((response) => {
      response.answers.forEach((answer) => {
        const questionData = data[answer.questionId];
        if (questionData) {
          if (['multiple_choice', 'checkbox'].includes(questionData.type)) {
            if (Array.isArray(answer.answerText)) {
              answer.answerText.forEach((selected) => {
                const option = questionData.options.find((opt) => opt.name === selected);
                if (option) option.count++;
              });
            } else {
              const option = questionData.options.find((opt) => opt.name === answer.answerText);
              if (option) option.count++;
            }
          } else if (['rating', 'nps'].includes(questionData.type)) {
            const rating = parseInt(answer.answerText);
            questionData.ratings[rating] = (questionData.ratings[rating] || 0) + 1;
            questionData.average = calculateAverage(questionData.ratings);
          } else if (['open-ended', 'conversational'].includes(questionData.type)) {
            const sentiment = analyzeSentiment(answer.answerText);
            questionData.responses.push(answer.answerText);
            questionData.sentiment[sentiment]++;
            const themes = extractThemes(answer.answerText);
            themes.forEach((theme) => {
              questionData.themes[theme] = (questionData.themes[theme] || 0) + 1;
            });
          }
        }
      });
    });

    return data;
  };

  // Calculate average rating
  const calculateAverage = (ratings) => {
    const total = Object.entries(ratings).reduce((sum, [rating, count]) => sum + parseInt(rating) * count, 0);
    const count = Object.values(ratings).reduce((sum, count) => sum + count, 0);
    return count > 0 ? (total / count).toFixed(2) : 0;
  };

  // Sentiment analysis using compromise
  const analyzeSentiment = (text) => {
    const doc = nlp(text);
    // The sentiment() method is now available directly on the nlp object
    const sentiment = doc.sentences().sentiment().score;
    return sentiment > 0.1 ? 'positive' : sentiment < -0.1 ? 'negative' : 'neutral';
  };

  // Theme extraction (simplified; enhance with backend NLP if needed)
  const extractThemes = (text) => {
    const doc = nlp(text);
    const topics = doc.topics().out('array');
    return topics.length > 0 ? topics : ['general'];
  };

  // Generate executive summary
  const generateSummary = (survey, responses) => {
    const npsQuestion = survey.questions.find((q) => q.questionType === 'nps');
    const npsScore = npsQuestion ? calculateNPS(responses, npsQuestion._id) : null;

    // Recalculate sentimentSummary and keyThemes based on current analysisData
    const currentAnalysisData = processResponsesForAnalysis(survey.questions, responses); // Re-process for summary
    const sentimentSummary = Object.values(currentAnalysisData).reduce(
      (acc, q) => {
        if (q.sentiment) {
          acc.positive += q.sentiment.positive;
          acc.neutral += q.sentiment.neutral;
          acc.negative += q.sentiment.negative;
        }
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    const keyThemes = Object.values(currentAnalysisData)
      .filter((q) => q.themes)
      .flatMap((q) => Object.entries(q.themes))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);

    return {
      responseCount: responses.length,
      npsScore,
      sentiment: sentimentSummary,
      themes: keyThemes,
      insights: `Based on ${responses.length} responses, the survey shows a ${npsScore ? `Net Promoter Score of ${npsScore}` : 'varied response'}. Sentiment is predominantly ${Object.keys(sentimentSummary).reduce((a, b) => (sentimentSummary[a] > sentimentSummary[b] ? a : b))}. Key themes include ${keyThemes.join(', ')}. Focus on addressing ${keyThemes[0] || 'general feedback'} to improve satisfaction.`
    };
  };

  // Calculate NPS
  const calculateNPS = (responses, questionId) => {
    let promoters = 0, detractors = 0, total = 0;
    responses.forEach((res) => {
      const answer = res.answers.find((a) => a.questionId === questionId);
      if (answer) {
        const score = parseInt(answer.answerText);
        if (score >= 9) promoters++;
        else if (score <= 6) detractors++;
        total++;
      }
    });
    return total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
  };

  // Export to Excel
  const exportToExcel = () => {
    const wsData = [['Question', 'Type', 'Response', 'Count']];
    Object.entries(analysisData).forEach(([qId, qData]) => {
      if (['multiple_choice', 'checkbox'].includes(qData.type)) {
        qData.options.forEach((opt) => {
          wsData.push([qData.questionText, qData.type, opt.name, opt.count]);
        });
      } else if (['rating', 'nps'].includes(qData.type)) {
        Object.entries(qData.ratings).forEach(([rating, count]) => {
          wsData.push([qData.questionText, qData.type, rating, count]);
        });
      } else if (['open-ended', 'conversational'].includes(qData.type)) {
        qData.responses.forEach((res, idx) => {
          wsData.push([qData.questionText, qData.type, res, 1]);
        });
      }
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Analysis');
    XLSX.writeFile(wb, `${survey.title}_analysis.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = [['Question', 'Type', 'Response', 'Count']];
    Object.entries(analysisData).forEach(([qId, qData]) => {
      if (['multiple_choice', 'checkbox'].includes(qData.type)) {
        qData.options.forEach((opt) => {
          csvData.push([qData.questionText, qData.type, opt.name, opt.count]);
        });
      } else if (['rating', 'nps'].includes(qData.type)) {
        Object.entries(qData.ratings).forEach(([rating, count]) => {
          csvData.push([qData.questionText, qData.type, rating, count]);
        });
      } else if (['open-ended', 'conversational'].includes(qData.type)) {
        qData.responses.forEach((res, idx) => {
          csvData.push([qData.questionText, qData.type, res, 1]);
        });
      }
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${survey.title}_analysis.csv`;
    link.click();
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Survey Analysis: ${survey.title}`, 10, 10);
    let y = 20;
    Object.entries(analysisData).forEach(([qId, qData]) => {
      doc.text(qData.questionText, 10, y);
      y += 10;
      if (['multiple_choice', 'checkbox'].includes(qData.type)) {
        qData.options.forEach((opt) => {
          doc.text(`${opt.name}: ${opt.count}`, 20, y);
          y += 10;
        });
      } else if (['rating', 'nps'].includes(qData.type)) {
        Object.entries(qData.ratings).forEach(([rating, count]) => {
          doc.text(`Rating ${rating}: ${count}`, 20, y);
          y += 10;
        });
      } else if (['open-ended', 'conversational'].includes(qData.type)) {
        doc.text('Sample Responses:', 20, y);
        y += 10;
        qData.responses.slice(0, 3).forEach((res) => {
          doc.text(res.substring(0, 50) + '...', 20, y);
          y += 10;
        });
      }
      y += 10;
    });
    doc.save(`${survey.title}_analysis.pdf`);
  };

  // Export to PowerPoint
  const exportToPPT = () => {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    slide.addText(`Survey Analysis: ${survey.title}`, { x: 0.5, y: 0.5, fontSize: 24, bold: true });
    Object.entries(analysisData).forEach(([qId, qData], idx) => {
      const qSlide = pptx.addSlide();
      qSlide.addText(qData.questionText, { x: 0.5, y: 0.5, fontSize: 18, bold: true });
      if (['multiple_choice', 'checkbox'].includes(qData.type)) {
        const chartData = qData.options.map((opt) => ({ name: opt.name, value: opt.count }));
        qSlide.addChart(pptx.ChartType.bar, [{ name: qData.questionText, labels: chartData.map(d => d.name), values: chartData.map(d => d.value) }], { x: 0.5, y: 1, w: 9, h: 4 });
      }
    });
    pptx.writeFile({ fileName: `${survey.title}_analysis.pptx` });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="ml-2 text-lg">Loading analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        <p>Survey data could not be loaded or found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* Executive Summary */}
      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-teal-600">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-4">
              <p><strong>Total Responses:</strong> {summary.responseCount}</p>
              {summary.npsScore && <p><strong>NPS Score:</strong> {summary.npsScore}</p>}
              <p><strong>Sentiment Distribution:</strong> Positive: {summary.sentiment.positive}, Neutral: {summary.sentiment.neutral}, Negative: {summary.sentiment.negative}</p>
              <p><strong>Key Themes:</strong> {summary.themes.join(', ')}</p>
              <p><strong>Insights:</strong> {summary.insights}</p>
            </div>
          ) : (
            <p>No summary available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Filters and Export Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <Listbox value={chartType} onChange={setChartType}>
          {({ open }) => (
            <>
              <Listbox.Button className="bg-teal-500 text-white py-2 px-4 rounded-lg flex items-center">
                Chart Type: {chartType} <ChevronDownIcon className="ml-2 h-5 w-5" />
              </Listbox.Button>
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Listbox.Options className="absolute mt-1 bg-white shadow-lg rounded-lg py-1 z-10">
                  {['bar', 'pie', 'doughnut'].map((type) => (
                    <Listbox.Option key={type} value={type} className="px-4 py-2 hover:bg-teal-100 cursor-pointer">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </>
          )}
        </Listbox>
        <div className="flex space-x-2">
          <Button onClick={exportToExcel} className="bg-teal-600 hover:bg-teal-700">Export to Excel</Button>
          <Button onClick={exportToCSV} className="bg-teal-600 hover:bg-teal-700">Export to CSV</Button>
          <Button onClick={exportToPDF} className="bg-teal-600 hover:bg-teal-700">Export to PDF</Button>
          <Button onClick={exportToPPT} className="bg-teal-600 hover:bg-teal-700">Export to PPT</Button>
        </div>
      </div>

      {/* AI Chatbot */}
      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-teal-600">Ask JijiPoll Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <Chatbot
            config={chatbotConfig}
            messageParser={(message) => ({ type: 'user', message: message })} // Changed to directly pass message object
            actionProvider={{
              handleUserMessage: (message) => {
                const doc = nlp(message.text); // Access text property
                const topics = doc.topics().out('array');
                const response = topics.length
                  ? `I found insights related to ${topics.join(', ')}. ${summary?.insights || 'No insights available.'}`
                  : 'Please specify a topic or question about the survey.';
                return [{ id: Date.now(), message: response, type: 'bot' }];
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(analysisData).map(([questionId, data]) => (
          <Card key={questionId} className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-teal-700">{data.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
              {['multiple_choice', 'checkbox'].includes(data.type) && data.options.length > 0 ? (
                <ChartComponent type={chartType} data={data.options.map(opt => ({ name: opt.name, count: opt.count }))} />
              ) : ['rating', 'nps'].includes(data.type) && Object.keys(data.ratings).length > 0 ? (
                <ChartComponent type={chartType} data={Object.entries(data.ratings).map(([rating, count]) => ({ name: rating, count }))} />
              ) : ['open-ended', 'conversational'].includes(data.type) && data.responses.length > 0 ? (
                <div>
                  <ChartComponent type="bar" data={Object.entries(data.sentiment).map(([sent, count]) => ({ name: sent, count }))} title="Sentiment Distribution" />
                  <p className="mt-4"><strong>Top Themes:</strong> {Object.entries(data.themes).map(([theme, count]) => `${theme} (${count})`).join(', ')}</p>
                  <p className="mt-2"><strong>Sample Responses:</strong></p>
                  <ul className="list-disc list-inside">
                    {data.responses.slice(0, 3).map((res, idx) => (
                      <li key={idx}>{res.substring(0, 100)}...</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-600">No data to display for this question type.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Raw Responses */}
      <Card className="mt-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-teal-600">Raw Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length > 0 ? (
            <ul className="space-y-4">
              {responses.slice(0, 10).map((res, index) => (
                <li key={res._id || index} className="border-b pb-2">
                  <p className="font-semibold text-teal-700">Response {index + 1} by {res.respondentId?.username || 'Anonymous'}</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                    {res.answers.map((answer, ansIndex) => {
                      const question = survey.questions.find((q) => q._id === answer.questionId);
                      return (
                        <li key={ansIndex}>
                          <span className="font-medium">{question?.questionText || 'Unknown Question'}:</span>{' '}
                          {answer.sentiment ? `(${answer.sentiment}) ` : ''}{JSON.stringify(answer.answerText)}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No raw responses available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Chart component for dynamic rendering
const ChartComponent = ({ type, data, title = 'Responses' }) => {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [{
      label: title,
      data: data.map((d) => d.count),
      backgroundColor: ['#14B8A6', '#34D399', '#FBBF24', '#F87171', '#A78BFA'],
      borderColor: ['#0F766E', '#059669', '#D97706', '#B91C1C', '#7C3AED'],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: type === 'bar' ? { y: { beginAtZero: true, ticks: { precision: 0 } } } : {}
  };

  return (
    <div className="w-full h-64">
      {type === 'bar' && <Bar data={chartData} options={options} />}
      {type === 'pie' && <Pie data={chartData} options={options} />}
      {type === 'doughnut' && <Doughnut data={chartData} options={options} />}
    </div>
  );
};

export default SurveyResponsesAnalysis;
