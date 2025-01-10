import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./App.css";

const CreditCardDropdown = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [swiggyOffers, setSwiggyOffers] = useState([]);
  const [zomatoOffers, setZomatoOffers] = useState([]);
  const [noOffersMessage, setNoOffersMessage] = useState("");

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
        setFilteredCards(uniqueCards);
      } catch (error) {
        console.error("Error fetching or parsing CSV files:", error);
      }
    };

    fetchData();
  }, []);

  const fetchOffers = async (card) => {
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

    try {
      const [swiggyData, zomatoData] = await Promise.all([
        fetchAndParseCSV("/Swiggy.csv"),
        fetchAndParseCSV("/Zomato.csv"),
      ]);

      const swiggyFiltered = filterOffers(swiggyData, card);
      const zomatoFiltered = filterOffers(zomatoData, card);

      setSwiggyOffers(swiggyFiltered);
      setZomatoOffers(zomatoFiltered);

      if (swiggyFiltered.length === 0 && zomatoFiltered.length === 0) {
        setNoOffersMessage("No offers found for this card.");
      } else {
        setNoOffersMessage("");
      }
    } catch (error) {
      console.error("Error fetching or filtering offers:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === "") {
      setFilteredCards([]);
      setNoOffersMessage("");
      setSelectedCard("");
      setSwiggyOffers([]);
      setZomatoOffers([]);
      return;
    }

    const matchingCards = creditCards.filter((card) =>
      card.toLowerCase().startsWith(value.toLowerCase())
    );
    setFilteredCards(matchingCards);

    if (matchingCards.length === 0) {
      setNoOffersMessage("No offers found for this card.");
    } else {
      setNoOffersMessage("");
    }
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setSearchTerm(card);
    setFilteredCards([]);
    fetchOffers(card);
  };

  return (
    <div className="container">
      <h1>Offers on Zomato and Swiggy</h1>
      <div className="search-dropdown">
        <input
          id="creditCardSearch"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          className="search-input"
        />
        {filteredCards.length > 0 && (
          <ul className="dropdown-list">
            {filteredCards.map((card, index) => (
              <li
                key={index}
                className="dropdown-item"
                onClick={() => handleCardSelect(card)}
              >
                {card}
              </li>
            ))}
          </ul>
        )}
      </div>

      {noOffersMessage && (
        <p className="no-offers-message" style={{ color: "red", textAlign: "center" }}>
          {noOffersMessage}
        </p>
      )}

      {selectedCard && !noOffersMessage && (
        <div className="offers-section">
          {zomatoOffers.length > 0 && (
            <div>
              <h2 className="offers-heading">Offers on Zomato</h2>
              <div className="offers-cards-container">
                {zomatoOffers.map((offer, index) => (
                  <div key={index} className="offer-card">
                    <p>
                      <strong>Offer:</strong> {offer.offer}
                    </p>
                    <p>
                      <strong>Coupon Code:</strong> {offer.coupon}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {swiggyOffers.length > 0 && (
            <div>
              <h2 className="offers-heading">Offers on Swiggy</h2>
              <div className="offers-cards-container">
                {swiggyOffers.map((offer, index) => (
                  <div key={index} className="offer-card">
                    <p>
                      <strong>Offer:</strong> {offer.offer}
                    </p>
                    <p>
                      <strong>Coupon Code:</strong> {offer.coupon}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditCardDropdown;
