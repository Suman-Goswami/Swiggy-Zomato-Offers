import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./App.css";

const CreditCardDropdown = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCards, setFilteredCards] = useState([]);
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

        // If offers exist, do not show the "No offers" message
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
      // Clear all offers and reset message if input is cleared
      setSwiggyOffers([]);
      setZomatoOffers([]);
      setShowNoOffersMessage(false);
    } else if (!creditCards.includes(value)) {
      // Show no offers message if the card name is not in the list
      setSwiggyOffers([]);
      setZomatoOffers([]);
      setShowNoOffersMessage(true);
    } else {
      // Fetch offers if the card name exists
      fetchOffers(value);
    }
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

      {showNoOffersMessage && (
        <p className="no-offers-message">No offers found for this card.</p>
      )}

      {(swiggyOffers.length > 0 || zomatoOffers.length > 0) && (
        <div className="offers-section">
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
        </div>
      )}
    </div>
  );
};

export default CreditCardDropdown;
