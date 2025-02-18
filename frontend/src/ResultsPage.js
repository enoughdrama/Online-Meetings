// src/ResultsPage.js
import React, { useState, useEffect } from 'react';

const ResultsPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/results');
        const data = await response.json();
        setTestResults(data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = testResults.filter((result) =>
    result.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>Результаты тестов</h1>
      <input
        type="text"
        placeholder="Поиск по имени пользователя"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredResults.map((test) => (
        <div key={test.id} className="test-result">
          <h2>{test.testName}</h2>
          <ul>
            {test.results.map((result) => (
              <li key={result.userId}>
                Пользователь: {result.user}, Результат: {result.score}, Время: {new Date(result.completedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ResultsPage;