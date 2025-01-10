import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./App.css";

const CreditCardOffers = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [swiggyOffers, setSwiggyOffers] = useState([]);
  const [zomatoOffers, setZomatoOffers] = useState([]);
  const [showNoOffersMessage, setShowNoOffersMessage] = useState(false);

  useEffect(() => {
    const fetchAndParseCSV = (filePath) =>
      new Promise((resolve, reject) => {
        Papa.parse(filePath, {
          download: true,
          header: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      });

    const extractCreditCards = (data) => {
      const cards = [];
      data.forEach((row) => {
        const applicableCards = row["Applicable to Credit cards"];
        if (applicableCards) {
          const cardNames = applicableCards
            .split(",")
            .map((card) => card.trim().split("(")[0].trim());
          cards.push(...cardNames);
        }
      });
      return cards;
    };

    const fetchData = async () => {
      try {
        const [swiggyData, zomatoData] = await Promise.all([
          fetchAndParseCSV("/Swiggy.csv"),
          fetchAndParseCSV("/Zomato.csv"),
        ]);

        const swiggyCards = extractCreditCards(swiggyData);
        const zomatoCards = extractCreditCards(zomatoData);

        const allCards = [...swiggyCards, ...zomatoCards];
        const uniqueCards = Array.from(new Set(allCards));

        setCreditCards(uniqueCards);
        setFilteredCards(uniqueCards); // Initialize filtered cards
      } catch (error) {
        console.error("Error fetching or parsing CSV files:", error);
      }
    };

    fetchData();
  }, []);

  const fetchOffers = (card) => {
    const fetchAndParseCSV = (filePath) =>
      new Promise((resolve, reject) => {
        Papa.parse(filePath, {
          download: true,
          header: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      });

    const filterOffers = (data, card) =>
      data
        .filter((row) => row["Applicable to Credit cards"]?.includes(card))
        .map((row) => ({
          offer: row["Offer"],
          coupon: row["Coupon code"],
        }));

    const loadOffers = async () => {
      try {
        const [swiggyData, zomatoData] = await Promise.all([
          fetchAndParseCSV("/Swiggy.csv"),
          fetchAndParseCSV("/Zomato.csv"),
        ]);

        const swiggyFiltered = filterOffers(swiggyData, card);
        const zomatoFiltered = filterOffers(zomatoData, card);

        setSwiggyOffers(swiggyFiltered);
        setZomatoOffers(zomatoFiltered);

        setShowNoOffersMessage(
          swiggyFiltered.length === 0 && zomatoFiltered.length === 0
        );
      } catch (error) {
        console.error("Error fetching or filtering offers:", error);
      }
    };

    loadOffers();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.trim();
    setSearchTerm(value);

    if (!value) {
      setFilteredCards(creditCards);
      setSelectedCard(null);
      setSwiggyOffers([]);
      setZomatoOffers([]);
      setShowNoOffersMessage(false);
    } else {
      const matchingCards = creditCards.filter((card) =>
        card.toLowerCase().startsWith(value.toLowerCase())
      );

      setFilteredCards(matchingCards);

      if (matchingCards.length === 0) {
        setShowNoOffersMessage(true);
        setSwiggyOffers([]);
        setZomatoOffers([]);
      } else {
        setShowNoOffersMessage(false);
      }
    }
  };

  const handleCardSelection = (card) => {
    setSearchTerm(card);
    setSelectedCard(card);
    setFilteredCards([]);
    fetchOffers(card);
  };

  return (
    <div className="container">
      <h1>Offers on Zomato and Swiggy</h1>
      <input
        id="creditCardSearch"
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Type to search..."
        className="search-input"
      />

      {filteredCards.length > 0 && (
        <ul className="dropdown">
          {filteredCards.map((card, index) => (
            <li
              key={index}
              className="dropdown-item"
              onClick={() => handleCardSelection(card)}
            >
              {card}
            </li>
          ))}
        </ul>
      )}

      {showNoOffersMessage && (
        <p className="no-offers-message">No offers found for this card.</p>
      )}

      {(swiggyOffers.length > 0 || zomatoOffers.length > 0) && selectedCard && (
        <div className="offers-section">
          <h2>Offers for {selectedCard}</h2>
          {swiggyOffers.length > 0 && (
            <div>
              <h3>Swiggy</h3>
              <ul>
                {swiggyOffers.map((offer, index) => (
                  <li key={index}>
                    <strong>Offer:</strong> {offer.offer} <br />
                    <strong>Coupon Code:</strong> {offer.coupon}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {zomatoOffers.length > 0 && (
            <div>
              <h3>Zomato</h3>
              <ul>
                {zomatoOffers.map((offer, index) => (
                  <li key={index}>
                    <strong>Offer:</strong> {offer.offer} <br />
                    <strong>Coupon Code:</strong> {offer.coupon}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditCardOffers;
