/*
 * The ten Step 11 blog posts (the director's "Nexera Website Blogs – First 10 SEO Articles",
 * nexera-reference/Nexera_Blog_section.docx), as article data for data/articles.js: text, SEO table,
 * FAQs and calls to action, with the Step 11 corrections (products no longer offered or not on the
 * site removed; product facts as in products.js and the datasheets; Hithium's own claims and chemistry
 * left out) and the placeholder links pointed at live pages. A link to a post that isn't published is
 * shown as its plain text (pages/Article.jsx), so it turns into a link on the day that post goes live.
 *
 * The text only, by slug (the article page's chunk); the metadata is in data/blogPostMeta.js. Each post's `figure` block names its diagram (components/article/diagrams). `minutes` and `eyebrow`
 * (category) come from the post's SEO table.
 */
export const POST_CONTENT = {
  "what-is-bess": {
    "lead": [
      {
        "b": "A battery energy storage system (BESS) is a system that stores electricity in batteries when it is cheap or plentiful and gives it back when it is needed."
      },
      " It lets you use solar power after sunset, keep a factory running through a power cut, and cut the cost of expensive peak-hour electricity. In India, BESS is now used in homes, commercial and industrial (C&I) facilities and large grid-scale projects."
    ],
    "sections": [
      {
        "id": "bess-full-form",
        "h2": "BESS full form",
        "blocks": [
          {
            "p": [
              "BESS stands for ",
              {
                "b": "Battery Energy Storage System"
              },
              ". You may also see it called a battery storage system, an energy storage system (ESS) or simply \"battery storage\". A BESS is more than a battery: it is a battery plus the power electronics, software, cooling and safety systems that make it usable on a real electrical network."
            ]
          }
        ]
      },
      {
        "id": "how-does-a-bess-work",
        "h2": "How does a BESS work?",
        "blocks": [
          {
            "p": "A BESS works in two directions."
          },
          {
            "figure": {
              "id": "bess-flow"
            }
          },
          {
            "ul": [
              [
                {
                  "b": "Charging:"
                },
                " when surplus electricity is available, from rooftop solar, a ground-mounted solar plant or cheap off-peak grid power, the system converts it and stores it as chemical energy in battery cells."
              ],
              [
                {
                  "b": "Discharging:"
                },
                " when electricity is needed, for example in the evening, during a power cut or in expensive peak-tariff hours, the system converts the stored energy back into AC power for your home, factory or the grid."
              ]
            ]
          },
          {
            "p": [
              "The key idea is ",
              {
                "b": "time shifting"
              },
              ": energy produced at one time is used at another. Solar panels produce most power around midday; most homes and many businesses need it in the evening. A battery bridges that gap."
            ]
          }
        ]
      },
      {
        "id": "the-main-parts-of-a-bess",
        "h2": "The main parts of a BESS",
        "blocks": [
          {
            "data": {
              "cols": [
                "Part",
                "What it does"
              ],
              "rows": [
                [
                  "Battery cells, modules and racks",
                  "Store the energy. Most C&I and utility systems today use LFP (lithium iron phosphate) cells."
                ],
                [
                  "Battery Management System (BMS)",
                  "Monitors cell voltage, current and temperature, balances the cells and protects the battery from unsafe conditions."
                ],
                [
                  "Power Conversion System (PCS)",
                  "Converts DC from the battery to AC for your loads or the grid, and AC back to DC to charge. A hybrid PCS can also take solar input."
                ],
                [
                  "Energy Management System (EMS)",
                  "The \"brain\" that decides when to charge and discharge, for example to shave peaks or use stored solar."
                ],
                [
                  "Thermal management",
                  "Liquid or air cooling that keeps cells in their ideal temperature range."
                ],
                [
                  "Fire protection",
                  "Detection (smoke, heat, gas) and suppression designed to catch and isolate faults early."
                ],
                [
                  "Switchgear, transformer and enclosure",
                  "Connect the system safely to your electrical network and protect it from the weather."
                ]
              ]
            }
          },
          {
            "p": [
              "Our ",
              {
                "a": "detailed article on BMS, PCS, EMS, cooling and fire safety",
                "to": "/blog/inside-a-bess-bms-pcs-ems-cooling-fire-safety"
              },
              " explains how these parts work together."
            ]
          }
        ]
      },
      {
        "id": "types-of-bess-by-scale",
        "h2": "Types of BESS by scale",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Residential (home battery storage):"
                },
                " a few kWh to about 20 kWh, paired with rooftop solar for evening use and backup."
              ],
              [
                {
                  "b": "Commercial and industrial (C&I):"
                },
                " from tens of kWh to a few MWh. Typical examples are a 50 kW / 100 kWh all-in-one cabinet or a 125 kW / 261 kWh liquid-cooled cabinet, used by factories, hospitals, malls, cold storage and campuses."
              ],
              [
                {
                  "b": "Utility-scale:"
                },
                " from several MWh to hundreds of MWh, installed at substations or solar parks to support the grid. Containerised blocks of 1 MWh to over 6 MWh are common building units."
              ]
            ]
          }
        ]
      },
      {
        "id": "types-of-bess-by-battery-chemistry",
        "h2": "Types of BESS by battery chemistry",
        "blocks": [
          {
            "p": [
              "Lead-acid, NMC (nickel manganese cobalt) and LFP are the common chemistries. For stationary storage in India's hot climate, ",
              {
                "b": "LFP (lithium iron phosphate)"
              },
              " is widely preferred because it is thermally more stable, supports thousands of charge-discharge cycles and does not rely on cobalt. TCL BlueArk systems use LFP cells."
            ]
          }
        ]
      },
      {
        "id": "what-is-a-bess-used-for",
        "h2": "What is a BESS used for?",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Solar self-consumption:"
                },
                " store midday solar and use it after sunset."
              ],
              [
                {
                  "b": "Backup power:"
                },
                " keep critical loads running during outages and cut diesel generator use."
              ],
              [
                {
                  "b": "Peak shaving:"
                },
                " use stored energy when your demand is highest to reduce demand-related charges."
              ],
              [
                {
                  "b": "Time-of-day (ToD) tariff savings:"
                },
                " charge when power is cheaper and discharge in peak-rate hours."
              ],
              [
                {
                  "b": "Solar plus storage for zero-export or export-limited sites:"
                },
                " store surplus instead of curtailing the solar array."
              ],
              [
                {
                  "b": "Grid support:"
                },
                " absorb surplus renewable power and supply it in the evening peak."
              ]
            ]
          }
        ]
      },
      {
        "id": "key-terms-explained-simply",
        "h2": "Key terms, explained simply",
        "blocks": [
          {
            "data": {
              "cols": [
                "Term",
                "Plain meaning"
              ],
              "rows": [
                [
                  "kW",
                  "Power: how fast energy can flow in or out."
                ],
                [
                  "kWh",
                  "Energy: how much is stored. A 261 kWh battery holds 261 units of electricity."
                ],
                [
                  "C-rate / \"0.5P\"",
                  "How quickly the battery is charged or discharged relative to its size. 0.5P means a full discharge takes about 2 hours."
                ],
                [
                  "Depth of discharge (DoD)",
                  "How much of the battery's capacity you actually use, for example 95%."
                ],
                [
                  "Round-trip efficiency (RTE)",
                  "The share of energy you get back out compared with what you put in."
                ],
                [
                  "State of health (SoH)",
                  "How much capacity the battery has left compared with new."
                ],
                [
                  "Cycle life",
                  "Number of full charge-discharge cycles before capacity falls to a stated level, for example 8000 cycles to 70% SoH."
                ]
              ]
            }
          }
        ]
      },
      {
        "id": "advantages-and-limits-of-bess",
        "h2": "Advantages and limits of BESS",
        "blocks": [
          {
            "p": [
              {
                "b": "Advantages:"
              },
              " lower peak-hour electricity cost, better use of your own solar, backup during outages, quieter and cleaner than a diesel generator, and faster response than any engine."
            ]
          },
          {
            "p": [
              {
                "b": "Limits to plan for:"
              },
              " battery capacity falls gradually with use, the system needs correct sizing and a safe installation, and savings depend on your tariff, load pattern and operating mode. A good supplier will size the system to your data rather than promise a fixed saving."
            ]
          }
        ]
      },
      {
        "id": "how-to-choose-the-right-bess",
        "h2": "How to choose the right BESS",
        "blocks": [
          {
            "p": "Start with four questions:"
          },
          {
            "ul": [
              [
                {
                  "b": "How much energy (kWh) do you need to store?"
                }
              ],
              [
                {
                  "b": "How much power (kW) do you need at once?"
                }
              ],
              [
                {
                  "b": "What is the main job:"
                },
                " solar shifting, peak shaving, ToD savings, backup or a mix?"
              ],
              [
                {
                  "b": "Where will it be installed, and what are the site conditions"
                },
                " (outdoor or indoor, temperature, grid quality, space)?"
              ]
            ]
          },
          {
            "p": [
              "Read ",
              {
                "a": "How a BESS is designed and sized",
                "to": "/blog/how-bess-is-designed-and-sized"
              },
              " for the full method."
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              {
                "b": "Nexera Powertech"
              },
              " is an authorised partner of TCL and Hithium, supplying BESS across India with design support, commissioning and after-sales service. Whether you are a business planning storage or a solar EPC company adding batteries to your offer, ",
              {
                "a": "talk to our BESS team",
                "to": "/contact"
              },
              " or ",
              {
                "a": "become a Nexera partner",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Talk to a Nexera BESS expert",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Become a Nexera partner",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "What is the full form of BESS?",
        "a": "BESS stands for Battery Energy Storage System."
      },
      {
        "q": "What is the difference between kW and kWh in a BESS?",
        "a": "kW is how much power the system can deliver at a moment; kWh is how much energy it can store. A 125 kW / 261 kWh system can supply up to 125 kW and, at that rate, runs for roughly two hours."
      },
      {
        "q": "What battery chemistry do BESS systems use?",
        "a": "Most modern C&I and utility BESS use LFP (lithium iron phosphate). Check each product's datasheet for the exact specification."
      },
      {
        "q": "How long does a BESS last?",
        "a": "It depends on chemistry, how often it cycles, temperature and operating mode. Datasheets state cycle life, for example 8000 cycles to 70% state of health for the TCL BlueArk W10, and the warranty sets what the manufacturer will stand behind."
      },
      {
        "q": "How much does a BESS cost in India?",
        "a": "Price depends on capacity (kWh), power rating (kW), brand, cooling type, PCS, site works and service terms. Share your load profile and electricity bills and Nexera will size the system and prepare a quotation."
      },
      {
        "q": "Is a BESS safe?",
        "a": "A well-designed BESS has protection at several levels: cell-level monitoring in the BMS, thermal management, gas and smoke detection and fire suppression, built to recognised standards. Safe installation and commissioning by trained teams matter as much as the hardware."
      }
    ],
    "related": [
      {
        "label": "C&I battery storage",
        "to": "/solutions/commercial-industrial"
      },
      {
        "label": "Utility-scale BESS",
        "to": "/solutions/utility-scale"
      },
      {
        "label": "Home battery storage",
        "to": "/solutions/residential"
      },
      {
        "label": "BESS products",
        "to": "/products"
      },
      {
        "label": "Become a partner",
        "to": "/become-a-partner"
      }
    ]
  },
  "why-india-needs-battery-energy-storage": {
    "lead": [
      {
        "b": "India needs battery energy storage because it now produces more solar power than it can use at midday, while demand in the evening and at night is still met by costlier sources."
      },
      " Storage moves cheap solar energy from the hours when it is abundant to the hours when it is needed. That one idea explains why governments, utilities, factories and solar companies across India are all turning to BESS."
    ],
    "sections": [
      {
        "id": "solar-is-growing-faster-than-the-grid-can-use-it",
        "h2": "Solar is growing faster than the grid can use it",
        "blocks": [
          {
            "p": [
              "India's solar capacity reached about ",
              {
                "a": "168 GW in August 2026, around 30% of total installed power capacity",
                "href": "https://taiyangnews.info/markets/india-curtails-146-billion-units-solar-power-2-months"
              },
              ", according to analysis by the Centre for Research on Energy and Clean Air (CREA). Solar output peaks around midday. When the grid cannot absorb all of it, solar plants are asked to reduce output, which is called ",
              {
                "b": "curtailment"
              },
              ". The same CREA analysis reports roughly 1.46 billion units of solar power curtailed in just two months."
            ]
          },
          {
            "p": "Every curtailed unit is clean energy that was available but wasted. Storage is the most direct way to save it."
          },
          {
            "small": "Figures as reported by the cited sources; checked November 2026."
          }
        ]
      },
      {
        "id": "the-evening-and-night-problem",
        "h2": "The evening and night problem",
        "blocks": [
          {
            "p": [
              "Solar generation falls to almost nothing after sunset, just as lighting, cooling and household and commercial loads rise. India's peak demand touched ",
              {
                "a": "270 GW on 16 July 2026",
                "href": "https://taiyangnews.info/markets/india-curtails-146-billion-units-solar-power-2-months"
              },
              ". Daily peaks now often fall in daylight hours, which solar can serve, but the evening ramp and night demand still depend on conventional plants. The same report notes that batteries already supplied up to 5.5 GW during night-time peaks."
            ]
          },
          {
            "figure": {
              "id": "duck-curve"
            }
          },
          {
            "p": [
              "This midday surplus and evening shortage is often called the ",
              {
                "b": "duck curve"
              },
              ". A BESS charges during the surplus and discharges into the shortage."
            ]
          },
          {
            "small": "Figures as reported by the cited sources; checked November 2026."
          }
        ]
      },
      {
        "id": "how-much-storage-does-india-need",
        "h2": "How much storage does India need?",
        "blocks": [
          {
            "p": [
              "The Central Electricity Authority (CEA) has estimated that India needs ",
              {
                "a": "236 GWh of BESS capacity by 2031-32",
                "href": "https://www.energy-storage.news/india-introduces-20-domestic-content-rule-for-viability-gap-funding-of-battery-storage"
              },
              ", within a total of about 411 GWh of storage that also includes pumped hydro. The India Energy Storage Alliance (IESA) reports that India added ",
              {
                "a": "7.9 GWh of BESS in the first half of 2026, taking operational capacity to about 8.5 GWh",
                "href": "https://powerpeakdigest.com/india-adds-7-9gwh-bess-capacity-h1-2026/"
              },
              ", and expects more to be commissioned by December 2026."
            ]
          },
          {
            "p": [
              "The government is backing this with ",
              {
                "b": "Viability Gap Funding (VGF)"
              },
              ". In June 2025 the Ministry of Power announced a ",
              {
                "a": "₹5,400 crore VGF scheme to support 30 GWh of BESS",
                "href": "https://www.pv-magazine.com/2025/06/11/india-offers-631-5-million-to-support-30-gwh-of-battery-storage/"
              },
              ", in addition to the earlier scheme. State utilities in Maharashtra, Gujarat, Rajasthan, Haryana and other states have since issued VGF-supported BESS tenders, for example a ",
              {
                "a": "450 MW / 900 MWh tender by GUVNL in Gujarat",
                "href": "https://solarquarter.com/2026/06/23/guvnl-floats-450-mw-900-mwh-bess-tender-in-gujarat-with-%e2%82%b918-lakh-mwh-vgf-support/amp/"
              },
              "."
            ]
          },
          {
            "small": "Figures as reported by the cited sources; checked November 2026."
          }
        ]
      },
      {
        "id": "why-storage-matters-for-businesses-and-factories",
        "h2": "Why storage matters for businesses and factories",
        "blocks": [
          {
            "p": "Grid-scale policy is only half the story. For a factory, hospital, mall or cold-storage unit, the reasons are closer to the electricity bill:"
          },
          {
            "ul": [
              [
                {
                  "b": "Time-of-day (ToD) tariffs:"
                },
                " under the Electricity (Rights of Consumers) Amendment Rules, 2023, ToD tariffs were to apply to commercial and industrial consumers with a maximum demand of 10 kW and above from April 2024. Power costs more in peak hours and less in solar hours, so shifting energy with a battery has a direct value. See ",
                {
                  "a": "our article on ToD tariff in Karnataka",
                  "to": "/blog/tod-tariff-karnataka-battery-storage"
                },
                "."
              ],
              [
                {
                  "b": "Demand charges:"
                },
                " a short spike in demand can set your monthly charge. A battery can cover the spike. ",
                {
                  "a": "Read about peak shaving",
                  "to": "/blog/peak-shaving-demand-charges-bess"
                },
                "."
              ],
              [
                {
                  "b": "Diesel generator costs and noise:"
                },
                " a battery responds faster, runs silently and can reduce generator running hours."
              ],
              [
                {
                  "b": "Power quality and outages:"
                },
                " a BESS with backup capability keeps critical loads running through grid failures."
              ],
              [
                {
                  "b": "Solar export limits:"
                },
                " where the DISCOM caps or blocks export, a battery stores the surplus instead of wasting it. ",
                {
                  "a": "See solar plus storage",
                  "to": "/blog/solar-plus-storage-zero-export-epc-guide"
                },
                "."
              ]
            ]
          }
        ]
      },
      {
        "id": "why-storage-matters-for-homes",
        "h2": "Why storage matters for homes",
        "blocks": [
          {
            "p": "A home battery lets a rooftop solar system serve the evening load and keeps lights and essential appliances on during outages. As ToD tariffs spread to more consumer categories, evening-shifted solar becomes more valuable."
          }
        ]
      },
      {
        "id": "what-this-means-for-solar-epc-companies",
        "h2": "What this means for solar EPC companies",
        "blocks": [
          {
            "p": [
              "Solar-only proposals are getting harder to win wherever export is limited or tariffs reward evening power. EPC companies that can offer ",
              {
                "b": "solar plus storage"
              },
              " answer more customer questions: backup, peak-hour savings, zero-export compliance and diesel reduction. Nexera supports EPC partners across India with sizing checks, single-line diagrams, commissioning support, installer training and India spares stock. Read the ",
              {
                "a": "partner programme details",
                "to": "/become-a-partner"
              },
              "."
            ]
          }
        ]
      },
      {
        "id": "challenges-to-be-honest-about",
        "h2": "Challenges to be honest about",
        "blocks": [
          {
            "p": [
              "BESS needs correct sizing, safe installation, grid-compliant design and trained service teams. Savings depend on your tariff and load pattern, so a supplier should size the system from your data rather than promise a fixed return. Good design is covered in ",
              {
                "a": "How a BESS is designed and sized",
                "to": "/blog/how-bess-is-designed-and-sized"
              },
              "."
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "Nexera Powertech supplies TCL and Hithium battery storage across India, from home systems to utility-scale blocks, with design, commissioning and service support. ",
              {
                "a": "Talk to our BESS team",
                "to": "/contact"
              },
              " or ",
              {
                "a": "become a Nexera partner",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Check if BESS suits your site",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Become a Nexera partner",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "Why does India need BESS?",
        "a": "Because solar generation and electricity demand do not line up. BESS stores midday solar surplus and supplies it in the evening and at night, reduces curtailment and supports grid stability."
      },
      {
        "q": "How much BESS capacity does India have today?",
        "a": "IESA's H1 2026 review puts operational BESS capacity at about 8.5 GWh, up sharply from a year earlier, against CEA's estimate of 236 GWh needed by 2031-32."
      },
      {
        "q": "What is VGF for BESS?",
        "a": "Viability Gap Funding is central government support that reduces the capital cost of eligible grid-scale battery projects so that they can supply stored power at a competitive tariff."
      },
      {
        "q": "Is battery storage useful for a small or medium business?",
        "a": "Often yes, where you pay time-of-day or demand-based charges, run diesel generators, face outages or have solar with limited export. The right answer depends on your load profile and tariff."
      },
      {
        "q": "Can I add a battery to my existing solar plant?",
        "a": "Usually yes. The method depends on whether the system is AC-coupled or DC-coupled. Read DC-coupled vs AC-coupled vs hybrid BESS."
      }
    ],
    "related": [
      {
        "label": "What Is a BESS?",
        "to": "/blog/what-is-bess"
      },
      {
        "label": "C&I battery storage",
        "to": "/solutions/commercial-industrial"
      },
      {
        "label": "ToD tariff in Karnataka",
        "to": "/blog/tod-tariff-karnataka-battery-storage"
      },
      {
        "label": "Become a partner",
        "to": "/become-a-partner"
      }
    ]
  },
  "dc-coupled-vs-ac-coupled-vs-hybrid-bess": {
    "lead": [
      {
        "b": "The difference is where the battery connects to the solar system. In an AC-coupled system the battery has its own inverter and joins on the AC side. In a DC-coupled system the battery shares a DC bus with the solar array and one inverter. A hybrid system uses one hybrid inverter (hybrid PCS) that handles solar, battery, grid and often a generator or backup output together."
      },
      " The right choice depends mainly on whether you are adding storage to existing solar or designing both together."
    ],
    "sections": [
      {
        "id": "why-coupling-matters",
        "h2": "Why coupling matters",
        "blocks": [
          {
            "p": "Every battery storage system must convert energy between DC (what solar panels and batteries use) and AC (what the grid and your loads use). Where the battery is connected decides how many conversions the energy goes through, how flexible the design is, and how easily you can add storage later."
          },
          {
            "figure": {
              "id": "coupling-three"
            }
          }
        ]
      },
      {
        "id": "ac-coupled-bess",
        "h2": "AC-coupled BESS",
        "blocks": [
          {
            "p": [
              "In an AC-coupled system, the solar plant keeps its own PV inverter. The battery has a separate bidirectional inverter, the ",
              {
                "b": "Power Conversion System (PCS)"
              },
              ", connected to the AC bus. Solar power reaches the battery as DC to AC (PV inverter) and then AC to DC (battery PCS), and returns to the loads as DC to AC again."
            ]
          },
          {
            "p": [
              {
                "b": "Strengths"
              }
            ]
          },
          {
            "ul": [
              [
                "Easiest way to ",
                {
                  "b": "retrofit storage to an existing solar plant"
                },
                " of any inverter brand."
              ],
              "Solar and battery are sized independently.",
              "Can charge from the grid as well as from solar.",
              "Battery can be added in stages."
            ]
          },
          {
            "p": [
              {
                "b": "Limits"
              }
            ]
          },
          {
            "ul": [
              "More conversion steps on the solar-to-battery path, so slightly lower efficiency.",
              "Backup (islanding) needs the PV inverter and battery PCS to work together during an outage.",
              "Two inverters mean more equipment and more commissioning."
            ]
          }
        ]
      },
      {
        "id": "dc-coupled-bess",
        "h2": "DC-coupled BESS",
        "blocks": [
          {
            "p": [
              "In a DC-coupled system, the solar array connects through MPPT (maximum power point tracking) controllers to a ",
              {
                "b": "shared DC bus"
              },
              " with the battery. One inverter converts to AC for the loads. Solar energy can go into the battery without being converted to AC first."
            ]
          },
          {
            "p": [
              {
                "b": "Strengths"
              }
            ]
          },
          {
            "ul": [
              "Fewer conversions between solar and battery, so higher efficiency on that path.",
              "Can store solar energy that would otherwise be lost when the array is larger than the inverter (\"clipping\").",
              "Fewer separate components in a new build."
            ]
          },
          {
            "p": [
              {
                "b": "Limits"
              }
            ]
          },
          {
            "ul": [
              "Harder to retrofit onto an existing AC solar plant.",
              "Solar and battery are tied to the same inverter and DC design, so there is less independence in sizing."
            ]
          }
        ]
      },
      {
        "id": "hybrid-bess-hybrid-inverter-or-hybrid-pcs",
        "h2": "Hybrid BESS (hybrid inverter or hybrid PCS)",
        "blocks": [
          {
            "p": "\"Hybrid\" has two meanings in the market, and it helps to separate them."
          },
          {
            "ul": [
              [
                {
                  "b": "A hybrid inverter / hybrid PCS"
                },
                " is one unit that combines solar MPPT inputs, battery charging and discharging, the grid connection and often a generator and backup load output. Architecturally, it is a DC-coupled design in a single box."
              ],
              [
                {
                  "b": "A hybrid system"
                },
                " can also simply mean a site that combines several energy sources, for example solar, grid, battery and diesel generator."
              ]
            ]
          },
          {
            "p": [
              "Hybrid designs suit ",
              {
                "b": "new solar-plus-storage projects"
              },
              ", especially where the customer wants backup, zero-export compliance and peak-hour discharge from one integrated cabinet."
            ]
          }
        ]
      },
      {
        "id": "side-by-side-comparison",
        "h2": "Side-by-side comparison",
        "blocks": [
          {
            "data": {
              "cols": [
                "Criterion",
                "AC-coupled",
                "DC-coupled",
                "Hybrid (hybrid PCS)"
              ],
              "rows": [
                [
                  "Best for",
                  "Adding storage to existing solar",
                  "New solar plus storage",
                  "New C&I solar plus storage with backup"
                ],
                [
                  "Solar-to-battery conversions",
                  "More",
                  "Fewer",
                  "Fewer"
                ],
                [
                  "Retrofit to existing PV",
                  "Easy",
                  "Difficult",
                  "Difficult unless PV is replaced or reworked"
                ],
                [
                  "Capture of clipped solar",
                  "No",
                  "Yes",
                  "Yes"
                ],
                [
                  "Grid charging",
                  "Yes",
                  "Yes",
                  "Yes"
                ],
                [
                  "Backup / islanding",
                  "Possible, needs coordination",
                  "Simpler, one inverter",
                  "Built in on most designs"
                ],
                [
                  "Equipment count",
                  "PV inverter plus battery PCS",
                  "One inverter plus DC-DC",
                  "One integrated unit"
                ]
              ]
            }
          }
        ]
      },
      {
        "id": "examples-from-the-tcl-and-hithium-range",
        "h2": "Examples from the TCL and Hithium range",
        "blocks": [
          {
            "ul": [
              [
                {
                  "a": "TCL BlueArk X5",
                  "to": "/products/tcl-blueark-x5"
                },
                ": an all-in-one cabinet that combines a 50 kW PCS, a 100 kWh LiFePO4 battery and a PV inverter for up to 100 kWp. It is a hybrid, DC-coupled design for new C&I solar-plus-storage projects, and up to ten cabinets can be paralleled."
              ],
              [
                {
                  "a": "TCL BlueArk W10",
                  "to": "/products/tcl-blueark-w10"
                },
                ": a 125 kW / 261 kWh liquid-cooled cabinet with its own PCS and AC output at 400 V. It connects on the AC side, which makes it a natural fit for adding storage to an existing solar plant or for pure peak shaving and ToD shifting. TCL's range is organised into C&I hybrid and C&I AC-coupled families."
              ],
              [
                {
                  "a": "Hithium ∞Power 1022 kWh Cabinet",
                  "to": "/products/hithium-power-cabinet-1022"
                },
                ": battery, thermal management and control in one liquid-cooled cabinet. It connects at 400 Vac and works with various PCS models, for grid-tied, off-grid and solar-storage hybrid applications."
              ]
            ]
          }
        ]
      },
      {
        "id": "indian-site-checks-that-apply-to-every-architecture",
        "h2": "Indian site checks that apply to every architecture",
        "blocks": [
          {
            "p": "No coupling choice removes the need for good site data. For example, TCL's India grid documentation for its hybrid PCS specifies that the unit trips instantly if neutral-to-earth voltage rises above 30 V, that only one N-PE bond is permitted, that an external transfer switch must be 4-pole, and that surge protection should be added on the backup output. Severe grid harmonics can also make a PCS disconnect. Nexera's engineers review neutral and earthing, harmonics and surge protection as part of every sizing check."
          }
        ]
      },
      {
        "id": "how-to-choose-in-four-steps",
        "h2": "How to choose in four steps",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Is there existing solar?"
                },
                " If yes and the inverters are in good condition, start with AC-coupled."
              ],
              [
                {
                  "b": "Is the project new?"
                },
                " Compare DC-coupled and hybrid, which usually need less equipment."
              ],
              [
                {
                  "b": "Do you need backup?"
                },
                " Prefer a design with native islanding and a generator input."
              ],
              [
                {
                  "b": "Is the array larger than the inverter?"
                },
                " DC coupling can capture energy that would otherwise be clipped."
              ]
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "Send us your load profile, electricity bills and existing solar details, and we will recommend the architecture and prepare a sizing check and single-line diagram. ",
              {
                "a": "Request a sizing check",
                "to": "/contact"
              },
              " or ",
              {
                "a": "join the Nexera EPC partner network",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Get a sizing check and single-line diagram",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Join the Nexera EPC partner network",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "What is the difference between AC-coupled and DC-coupled battery storage?",
        "a": "AC-coupled batteries connect after the solar inverter through their own inverter. DC-coupled batteries connect on the DC side with the solar array and share one inverter."
      },
      {
        "q": "Is a hybrid inverter the same as DC-coupled?",
        "a": "In most designs, yes. A hybrid inverter is a DC-coupled architecture packaged into a single unit with solar, battery and grid connections."
      },
      {
        "q": "Can I add a battery to my existing rooftop solar plant?",
        "a": "Yes, most simply with an AC-coupled battery system. A hybrid or DC-coupled system usually requires changing the solar inverter arrangement."
      },
      {
        "q": "Which is more efficient?",
        "a": "DC coupling has fewer conversions on the solar-to-battery path, so it is generally more efficient there. The real-world difference depends on the equipment and operating pattern, so ask for datasheet efficiencies."
      },
      {
        "q": "What is a PCS in a BESS?",
        "a": "The Power Conversion System converts DC from the battery to AC for use and converts AC back to DC for charging."
      },
      {
        "q": "Which should an EPC company stock?",
        "a": "Most EPC companies need both: an AC-coupled cabinet for retrofits and a hybrid cabinet for new projects. Nexera helps EPC partners choose, size and commission both."
      }
    ],
    "related": [
      {
        "label": "TCL BlueArk X5",
        "to": "/products/tcl-blueark-x5"
      },
      {
        "label": "TCL BlueArk W10",
        "to": "/products/tcl-blueark-w10"
      },
      {
        "label": "Hithium",
        "to": "/partners/hithium"
      },
      {
        "label": "Solar plus storage for EPC companies",
        "to": "/blog/solar-plus-storage-zero-export-epc-guide"
      },
      {
        "label": "Become a partner",
        "to": "/become-a-partner"
      }
    ]
  },
  "how-bess-is-designed-and-sized": {
    "lead": [
      {
        "b": "Designing a BESS means answering four questions in order: what job must the battery do, how much power (kW) and energy (kWh) does that job need, how will it connect to your electrical system, and what will it deliver after years of ageing."
      },
      " Getting the sizing wrong in either direction is costly: too small and the savings or backup fall short, too large and capital sits idle."
    ],
    "sections": [
      {
        "id": "step-1-define-the-job",
        "h2": "Step 1: Define the job",
        "blocks": [
          {
            "p": "Every design starts with the main purpose, because it sets the operating mode and the size:"
          },
          {
            "figure": {
              "id": "sizing-steps"
            }
          },
          {
            "ul": [
              [
                {
                  "b": "Peak shaving"
                },
                " to cut demand charges"
              ],
              [
                {
                  "b": "ToD arbitrage"
                },
                " to move energy from low-tariff to peak-tariff hours"
              ],
              [
                {
                  "b": "Solar shifting or zero-export"
                },
                " to store surplus solar"
              ],
              [
                {
                  "b": "Backup"
                },
                " for critical loads, replacing or supporting a diesel generator"
              ],
              [
                {
                  "b": "A combination"
                },
                ", which is common, and needs careful priority rules in the EMS"
              ]
            ]
          }
        ]
      },
      {
        "id": "step-2-collect-the-right-data",
        "h2": "Step 2: Collect the right data",
        "blocks": [
          {
            "p": "Good sizing is a data exercise. Ask for:"
          },
          {
            "data": {
              "cols": [
                "Input",
                "Why it matters"
              ],
              "rows": [
                [
                  "12 months of electricity bills",
                  "Shows tariff category, demand charges, energy charges and seasonal swings"
                ],
                [
                  "15-minute interval load data (from the meter or a logger)",
                  "Shows the true peaks and the shape of the daily load"
                ],
                [
                  "Contract demand and sanctioned load",
                  "Sets the limits for peak shaving"
                ],
                [
                  "ToD slots and rates in your tariff order",
                  "Defines the value of shifting energy"
                ],
                [
                  "Existing solar size, inverter brand and export rules",
                  "Decides the coupling method and zero-export needs"
                ],
                [
                  "Critical load list for backup",
                  "Sets the power and duration the battery must hold"
                ],
                [
                  "Diesel generator rating and running hours",
                  "Decides whether and how the generator integrates"
                ],
                [
                  "Site details: space, floor strength, ambient temperature, access, earthing, nearby non-linear loads",
                  "Decides the enclosure, cooling and protection"
                ]
              ]
            }
          }
        ]
      },
      {
        "id": "step-3-size-power-kw-and-energy-kwh",
        "h2": "Step 3: Size power (kW) and energy (kWh)",
        "blocks": [
          {
            "p": [
              {
                "b": "Power (kW)"
              },
              " is how fast the battery must deliver or absorb energy. For peak shaving it is the amount of demand you want to cut; for backup it is the critical load."
            ]
          },
          {
            "p": [
              {
                "b": "Energy (kWh)"
              },
              " is how long it must hold that power. For peak shaving and ToD it is the energy in the peak window; for solar shifting it is the surplus you want to capture."
            ]
          },
          {
            "p": "Then adjust for the real-world factors:"
          },
          {
            "ul": [
              [
                {
                  "b": "Depth of discharge (DoD):"
                },
                " you cannot use 100% of the nameplate. TCL's BlueArk W10, for example, is rated at 95% DoD."
              ],
              [
                {
                  "b": "Round-trip efficiency and conversion losses:"
                },
                " some energy is lost in charging and discharging."
              ],
              [
                {
                  "b": "Degradation:"
                },
                " capacity falls with use. Warranties commonly define end of life at a state of health such as 70%."
              ],
              [
                {
                  "b": "Duration (C-rate):"
                },
                " a 0.5P system such as the W10 delivers its full power for about two hours; a 0.25P system such as the Hithium ∞Power 6.25 MWh in its 4-hour configuration takes about four hours."
              ]
            ]
          }
        ]
      },
      {
        "id": "a-worked-example-hypothetical-numbers",
        "h2": "A worked example (hypothetical numbers)",
        "blocks": [
          {
            "p": "A factory wants the battery to carry a steady 60 kW load through a four-hour evening peak window."
          },
          {
            "formula": [
              "Energy needed = 60 kW × 4 h = 240 kWh (at the AC output)",
              "Nameplate (year 1) ≈ 240 ÷ (0.95 DoD × 0.95 assumed losses) ≈ 266 kWh"
            ]
          },
          {
            "p": "A single 125 kW / 261 kWh cabinet is therefore roughly right for the first years. If the plant must still deliver the full 240 kWh when the battery has aged to 70% state of health, the nameplate would need to be about 266 ÷ 0.70 ≈ 380 kWh. Designers handle this by oversizing, by accepting slightly shorter coverage later, or by planning to add capacity. The right choice is a commercial decision, not only a technical one. These numbers are illustrative; your design must use your own data and the manufacturer's datasheet."
          }
        ]
      },
      {
        "id": "step-4-choose-the-architecture-and-equipment",
        "h2": "Step 4: Choose the architecture and equipment",
        "blocks": [
          {
            "p": [
              "Decide AC-coupled, DC-coupled or hybrid (see ",
              {
                "a": "DC-coupled vs AC-coupled vs hybrid BESS",
                "to": "/blog/dc-coupled-vs-ac-coupled-vs-hybrid-bess"
              },
              "), then select the cabinet or container, the PCS rating in kVA, the cooling method and the fire protection. Check power factor needs, because a PCS has a limited reactive-power window. For instance, TCL's X5 operates between 0.8 lagging and 0.8 leading, so loads at lower power factor need correction first."
            ]
          }
        ]
      },
      {
        "id": "step-5-design-the-electrical-connection",
        "h2": "Step 5: Design the electrical connection",
        "blocks": [
          {
            "p": "This is where many projects are won or lost:"
          },
          {
            "ul": [
              "Point of connection and protection settings",
              "Neutral and earthing arrangement (single N-PE bond, earth pits to IS 3043 and DISCOM rules)",
              "Surge protection on every exposed port",
              "Transfer switch type (a 4-pole switch where TCL specifies it) and generator integration",
              "Harmonics at the point of common coupling, especially with many VFDs, UPS units or rectifiers",
              "Communication and internet access, which TCL's X5 warranty requires within 3 months of installation"
            ]
          },
          {
            "p": [
              "The output is a ",
              {
                "b": "single-line diagram (SLD)"
              },
              " and a protection schedule."
            ]
          }
        ]
      },
      {
        "id": "step-6-plan-the-civil-and-mechanical-work",
        "h2": "Step 6: Plan the civil and mechanical work",
        "blocks": [
          {
            "p": "A liquid-cooled 261 kWh outdoor cabinet weighs about 2.7 tonnes and is rated IP55, so it needs a proper plinth, crane access and cable routes. Datasheets note derating above 45 °C ambient, so shade, airflow and layout matter in Indian summers."
          }
        ]
      },
      {
        "id": "step-7-set-the-operating-strategy-and-commission",
        "h2": "Step 7: Set the operating strategy and commission",
        "blocks": [
          {
            "p": "The EMS must be set with charge and discharge windows, SOC limits, demand limits, export rules and backup reserve. Commissioning by a trained team, followed by remote monitoring, protects both performance and warranty."
          }
        ]
      },
      {
        "id": "common-sizing-mistakes",
        "h2": "Common sizing mistakes",
        "blocks": [
          {
            "ul": [
              "Sizing from the monthly bill instead of interval data",
              "Ignoring degradation and usable capacity",
              "Buying kWh when the problem is kW, or the reverse",
              "Ignoring neutral, earthing and harmonic conditions on site",
              "Forgetting that the battery also needs a charging source and enough charging hours"
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "Send your bills, load data and site photos, and our team will return a sizing check and SLD. ",
              {
                "a": "Request a sizing check",
                "to": "/contact"
              },
              " or ",
              {
                "a": "become a Nexera EPC partner",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Send load profile and bills for a sizing check",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Become a Nexera EPC partner",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "How do I calculate battery capacity for my factory?",
        "a": "Multiply the load you want to support (kW) by the hours you need it, then divide by usable DoD and efficiency factors, and add margin for ageing. A sizing check on your actual load profile is more reliable than a rule of thumb."
      },
      {
        "q": "How big a BESS do I need for peak shaving?",
        "a": "It depends on how much demand you want to cut and for how long. Interval data shows how narrow or wide your peaks are."
      },
      {
        "q": "What is the difference between kW and kWh when sizing?",
        "a": "kW sets how much load the battery can carry at once; kWh sets how long it can carry it."
      },
      {
        "q": "Do I need an engineer to design a BESS?",
        "a": "Yes. Sizing, protection, earthing and EMS settings affect safety, savings and warranty."
      },
      {
        "q": "Does Nexera provide BESS design support?",
        "a": "Yes. Nexera provides a sizing check and single-line diagram for each project, plus commissioning support and installer training for EPC partners."
      }
    ],
    "related": [
      {
        "label": "What Is a BESS?",
        "to": "/blog/what-is-bess"
      },
      {
        "label": "DC vs AC vs hybrid BESS",
        "to": "/blog/dc-coupled-vs-ac-coupled-vs-hybrid-bess"
      },
      {
        "label": "Peak shaving with BESS",
        "to": "/blog/peak-shaving-demand-charges-bess"
      },
      {
        "label": "TCL BlueArk W10",
        "to": "/products/tcl-blueark-w10"
      },
      {
        "label": "Talk to our team",
        "to": "/contact"
      }
    ]
  },
  "inside-a-bess-bms-pcs-ems-cooling-fire-safety": {
    "lead": [
      {
        "b": "A BESS looks like a large metal cabinet, but inside it is a chain of linked systems: cells and modules that store the energy, a BMS that protects them, a PCS that converts power, an EMS that decides what to do, a thermal system that keeps temperatures safe, and fire protection that contains faults."
      },
      " Each layer must work correctly with the others, and with the Indian grid. That is why battery storage is closer to a small power plant than to a household appliance."
    ],
    "sections": [
      {
        "id": "from-cell-to-container-the-building-blocks",
        "h2": "From cell to container: the building blocks",
        "blocks": [
          {
            "p": "A BESS is built up in stages:"
          },
          {
            "figure": {
              "id": "cell-to-system"
            }
          },
          {
            "ul": [
              [
                {
                  "b": "Cell:"
                },
                " the basic unit, for example a 3.2 V, 314 Ah LFP cell used in the TCL BlueArk W10."
              ],
              [
                {
                  "b": "Module / pack:"
                },
                " many cells connected in series and parallel, with sensors and a controller."
              ],
              [
                {
                  "b": "Rack / cluster:"
                },
                " modules stacked and wired to reach the system voltage, for example 832 V rated for the W10's 260 cells in series."
              ],
              [
                {
                  "b": "Cabinet or container:"
                },
                " the enclosure with cooling, fire protection, switchgear and controls. C&I units are cabinets of about 100 to 261 kWh; utility-scale blocks go from about 1 MWh to over 6 MWh."
              ],
              [
                {
                  "b": "System:"
                },
                " the cabinet plus PCS, transformer, switchgear, EMS and the connection to your network."
              ]
            ]
          }
        ]
      },
      {
        "id": "bms-the-guardian-of-the-battery",
        "h2": "BMS: the guardian of the battery",
        "blocks": [
          {
            "p": [
              "The ",
              {
                "b": "Battery Management System"
              },
              " watches every cell's voltage and temperature and the pack current. It balances cells so that none drifts too far, estimates state of charge and state of health, and disconnects the battery if a limit is breached. Well-designed systems use protection at several levels, from cell to module to rack to cabinet, so a fault at one level can be isolated before it spreads."
            ]
          }
        ]
      },
      {
        "id": "pcs-the-translator-between-battery-and-grid",
        "h2": "PCS: the translator between battery and grid",
        "blocks": [
          {
            "p": [
              "The ",
              {
                "b": "Power Conversion System"
              },
              " converts DC from the battery to AC for your loads, and AC to DC for charging. In India the PCS also has to behave correctly on a real, imperfect grid. TCL's India grid documentation for its hybrid PCS, for example, describes voltage and frequency trip windows, disconnection within 0.1 seconds on phase loss or neutral loss, a neutral-to-earth voltage limit, and built-in surge protection on some ports but not others. A ",
              {
                "b": "hybrid PCS"
              },
              " adds solar MPPT inputs and a backup output."
            ]
          }
        ]
      },
      {
        "id": "ems-the-brain",
        "h2": "EMS: the brain",
        "blocks": [
          {
            "p": [
              "The ",
              {
                "b": "Energy Management System"
              },
              " is the software that decides when to charge, when to discharge and how fast. It runs modes such as peak shaving, ToD shifting, solar self-use, zero export and backup. Good EMS data also enables remote diagnostics through protocols such as Modbus TCP and MQTT."
            ]
          }
        ]
      },
      {
        "id": "thermal-management-air-cooling-vs-liquid-cooling",
        "h2": "Thermal management: air cooling vs liquid cooling",
        "blocks": [
          {
            "p": "Batteries age faster and become less safe when they run hot or with large temperature differences between cells. Two approaches are common:"
          },
          {
            "data": {
              "cols": [
                "",
                "Air cooling",
                "Liquid cooling"
              ],
              "rows": [
                [
                  "How it works",
                  "Fans and air-conditioning move air across the cells",
                  "A coolant loop (for example glycol-water) carries heat away through cold plates"
                ],
                [
                  "Temperature uniformity between cells",
                  "Lower",
                  "Higher"
                ],
                [
                  "Footprint",
                  "Larger for the same energy",
                  "Smaller"
                ],
                [
                  "Typical use",
                  "Smaller stackable C&I systems",
                  "Larger C&I cabinets and utility-scale blocks"
                ]
              ]
            }
          },
          {
            "p": "The TCL BlueArk W10 uses intelligent liquid cooling. It is rated for outdoor use at IP55 and operates from −30 °C to 50 °C, with derating above 45 °C. In Indian summers, the cooling design and site ventilation matter."
          }
        ]
      },
      {
        "id": "fire-protection-and-safety",
        "h2": "Fire protection and safety",
        "blocks": [
          {
            "p": "LFP chemistry is more thermally stable than many alternatives, but safe design never relies on chemistry alone. A well-engineered BESS combines:"
          },
          {
            "ul": [
              [
                {
                  "b": "Early detection:"
                },
                " smoke, heat and combustible-gas detectors"
              ],
              [
                {
                  "b": "Containment:"
                },
                " thermal barriers between modules and an enclosure designed to limit fault spread"
              ],
              [
                {
                  "b": "Suppression:"
                },
                " aerosol, clean-agent or water-based systems, depending on the design"
              ],
              [
                {
                  "b": "Gas and pressure management:"
                },
                " ventilation and, on some designs, explosion-relief panels"
              ],
              [
                {
                  "b": "Emergency stop and alarms"
                }
              ]
            ]
          },
          {
            "p": [
              "The TCL BlueArk W10 uses combustible-gas detection with aerosol suppression. When comparing products, ask for the ",
              {
                "b": "issued certificates and test reports for the exact model"
              },
              " you are buying, for example IEC 62619 for battery safety and UN 38.3 for transport, rather than relying on a brochure."
            ]
          }
        ]
      },
      {
        "id": "why-a-bess-is-more-complex-than-it-looks",
        "h2": "Why a BESS is more complex than it looks",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Many disciplines meet in one system:"
                },
                " electrochemistry, power electronics, thermal engineering, controls, fire safety and civil works."
              ],
              [
                {
                  "b": "The grid is not ideal:"
                },
                " voltage swings, harmonics, loose neutrals and surges are common in the field, and a PCS must be matched to them."
              ],
              [
                {
                  "b": "Settings change outcomes:"
                },
                " the same hardware can save money or lose it depending on how the EMS is configured."
              ],
              [
                {
                  "b": "Safety depends on installation:"
                },
                " earthing, cable routing, torque, clearances and commissioning are as important as the product."
              ],
              [
                {
                  "b": "Warranty has conditions:"
                },
                " TCL's X5 warranty, for example, depends on installation and commissioning by a certified or authorised installer and an internet connection within three months."
              ],
              [
                {
                  "b": "The system must be serviced for 10 years or more:"
                },
                " you need spares, remote diagnostics and trained technicians."
              ]
            ]
          },
          {
            "p": "This is why Nexera pairs supply with design support, commissioning, installer training and an India spares stock, rather than only delivering equipment."
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "Need to understand what goes into your project, or train your technicians? ",
              {
                "a": "Contact our technical team",
                "to": "/contact"
              },
              " or ",
              {
                "a": "join the Nexera partner and training programme",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Ask about commissioning, training and service",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Join the partner and training programme",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "What does BMS stand for in a battery system?",
        "a": "Battery Management System. It monitors and protects the cells."
      },
      {
        "q": "What is the difference between BMS, PCS and EMS?",
        "a": "The BMS protects the battery, the PCS converts power between DC and AC, and the EMS decides when to charge and discharge."
      },
      {
        "q": "Is liquid cooling better than air cooling for BESS?",
        "a": "Liquid cooling usually gives better temperature uniformity and a smaller footprint in larger systems. Air cooling can be simpler and suitable for smaller stackable systems. The right choice depends on size, climate and budget."
      },
      {
        "q": "Are lithium iron phosphate (LFP) batteries safe?",
        "a": "LFP is generally more thermally stable than other lithium chemistries, but a safe system also needs a good BMS, thermal management, fire protection and correct installation."
      },
      {
        "q": "Who services BESS in India?",
        "a": "Nexera provides commissioning, remote diagnostics, spares and installer training for TCL and Hithium systems, so that EPC partners can handle first-line service."
      }
    ],
    "related": [
      {
        "label": "What Is a BESS?",
        "to": "/blog/what-is-bess"
      },
      {
        "label": "How a BESS is designed and sized",
        "to": "/blog/how-bess-is-designed-and-sized"
      },
      {
        "label": "TCL BlueArk W10",
        "to": "/products/tcl-blueark-w10"
      },
      {
        "label": "Hithium",
        "to": "/partners/hithium"
      },
      {
        "label": "Become a partner",
        "to": "/become-a-partner"
      }
    ]
  },
  "commercial-industrial-bess-india-guide": {
    "lead": [
      {
        "b": "Commercial and industrial (C&I) BESS is a battery storage system installed at a business site, typically between about 50 kWh and a few MWh, to cut electricity cost, protect operations from outages and make better use of on-site solar."
      },
      " For many Indian businesses, the main drivers are time-of-day tariffs, demand charges, diesel generator costs and limits on solar export."
    ],
    "sections": [
      {
        "id": "who-uses-candi-battery-storage",
        "h2": "Who uses C&I battery storage?",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Manufacturing plants and industrial estates:"
                },
                " peak demand and ToD tariffs"
              ],
              [
                {
                  "b": "Hospitals and laboratories:"
                },
                " reliable backup and cleaner alternative to diesel"
              ],
              [
                {
                  "b": "Malls, hotels, offices and IT parks:"
                },
                " evening peak loads and cooling demand"
              ],
              [
                {
                  "b": "Cold storage and food processing:"
                },
                " protection of temperature-critical loads"
              ],
              [
                {
                  "b": "Textile, plastics, pharma and engineering units:"
                },
                " high contract demand and shift patterns"
              ],
              [
                {
                  "b": "Schools, colleges and campuses:"
                },
                " solar-rich daytime, heavy evening use"
              ],
              [
                {
                  "b": "EV charging hubs:"
                },
                " high short peaks that stress the connection"
              ],
              [
                {
                  "b": "Telecom and data facilities:"
                },
                " continuity of supply"
              ]
            ]
          }
        ]
      },
      {
        "id": "the-five-main-business-cases",
        "h2": "The five main business cases",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "ToD tariff savings:"
                },
                " charge in cheaper hours or from solar, discharge in peak hours. ",
                {
                  "a": "See ToD tariff in Karnataka",
                  "to": "/blog/tod-tariff-karnataka-battery-storage"
                },
                "."
              ],
              [
                {
                  "b": "Peak shaving:"
                },
                " reduce the maximum demand that sets your demand charge. ",
                {
                  "a": "See peak shaving and demand charges",
                  "to": "/blog/peak-shaving-demand-charges-bess"
                },
                "."
              ],
              [
                {
                  "b": "Solar self-consumption and zero-export:"
                },
                " store surplus solar instead of curtailing it. ",
                {
                  "a": "See solar plus storage",
                  "to": "/blog/solar-plus-storage-zero-export-epc-guide"
                },
                "."
              ],
              [
                {
                  "b": "Backup and diesel reduction:"
                },
                " ride through outages and cut generator running hours."
              ],
              [
                {
                  "b": "Capacity relief:"
                },
                " a battery can support the load when transformer capacity is insufficient, which can postpone a transformer upgrade in some cases."
              ]
            ]
          },
          {
            "figure": {
              "id": "ci-cases"
            }
          },
          {
            "p": "Most projects combine two or three of these, and the right priority order is set in the energy management system (EMS)."
          }
        ]
      },
      {
        "id": "typical-candi-system-sizes",
        "h2": "Typical C&I system sizes",
        "blocks": [
          {
            "data": {
              "cols": [
                "Product example",
                "Power / energy",
                "Notes"
              ],
              "rows": [
                [
                  [
                    {
                      "a": "TCL BlueArk X5-50K-100",
                      "to": "/products/tcl-blueark-x5"
                    }
                  ],
                  "50 kW / 100 kWh",
                  "All-in-one cabinet with PCS, battery and PV inverter for up to 100 kWp; up to 10 cabinets in parallel (500 kW / 1 MWh)"
                ],
                [
                  [
                    {
                      "a": "TCL BlueArk W10",
                      "to": "/products/tcl-blueark-w10"
                    }
                  ],
                  "125 kW / 261 kWh",
                  "Liquid-cooled outdoor cabinet; modular parallel expansion up to about 6.3 MWh"
                ],
                [
                  [
                    {
                      "a": "Hithium ∞Power 1022 kWh Cabinet",
                      "to": "/products/hithium-power-cabinet-1022"
                    }
                  ],
                  "1022 kWh",
                  "Liquid-cooled; battery, thermal management and control in one cabinet; connects at 400 Vac and works with various PCS models"
                ]
              ]
            }
          },
          {
            "p": "TCL BlueArk systems use LFP (lithium iron phosphate) cells. Check each product page for the exact specification."
          }
        ]
      },
      {
        "id": "is-candi-bess-right-for-your-business-a-quick-checklist",
        "h2": "Is C&I BESS right for your business? A quick checklist",
        "blocks": [
          {
            "p": "Storage is more likely to pay off if most of these apply:"
          },
          {
            "ul": [
              "You are on an HT or large LT tariff with ToD slots and a meaningful gap between peak and normal or solar-hour rates",
              "Demand charges form a large part of your bill, with short sharp peaks",
              "You run diesel generators for outages or peak periods",
              "You have or plan rooftop or ground-mounted solar, especially with export limits",
              "Your load is steady enough for the battery to cycle most days",
              "You have outdoor or covered space for a cabinet with access for a crane"
            ]
          },
          {
            "p": "If few of these apply, a solar plant alone or power-factor and load management may serve you better. A good supplier will tell you so."
          }
        ]
      },
      {
        "id": "what-drives-the-cost-and-payback-of-a-bess",
        "h2": "What drives the cost and payback of a BESS?",
        "blocks": [
          {
            "p": "There is no single price for \"a BESS\" in India. The price depends on:"
          },
          {
            "ul": [
              "Energy (kWh) and power (kW) rating",
              "Brand, cooling type and warranty terms",
              "Hybrid vs AC-coupled architecture and PCS selection",
              "Site works: plinth, cabling, earthing, fire safety clearances, approvals",
              "Freight, GST, commissioning and service terms"
            ]
          },
          {
            "p": "Payback is driven by your tariff gap, how many days a year the battery cycles, the share of demand charges you avoid, diesel use you replace, and the battery's usable life. A simple way to think about it:"
          },
          {
            "formula": [
              "Annual saving ≈ kWh shifted per year × tariff difference (₹/kWh) + demand charge avoided + diesel cost avoided"
            ]
          },
          {
            "p": "Because the inputs are specific to your site, ask for a written savings estimate with stated assumptions rather than a headline percentage."
          }
        ]
      },
      {
        "id": "how-a-candi-project-runs",
        "h2": "How a C&I project runs",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Site assessment and data collection:"
                },
                " bills, interval data, single-line diagram, photos."
              ],
              [
                {
                  "b": "Sizing and design:"
                },
                " system size, architecture, protection and SLD."
              ],
              [
                {
                  "b": "Quotation and approvals:"
                },
                " commercial offer, DISCOM and statutory approvals where required."
              ],
              [
                {
                  "b": "Supply and installation:"
                },
                " plinth, cabling, earthing, communication."
              ],
              [
                {
                  "b": "Commissioning and EMS setup:"
                },
                " by trained or certified teams."
              ],
              [
                {
                  "b": "Monitoring and service:"
                },
                " remote diagnostics, preventive checks, warranty support."
              ]
            ]
          }
        ]
      },
      {
        "id": "what-to-ask-a-bess-supplier",
        "h2": "What to ask a BESS supplier",
        "blocks": [
          {
            "ul": [
              "Which exact model, cell chemistry and cell supplier?",
              "What are the cycle life, state-of-health guarantee and warranty terms, and what voids them?",
              "Which certificates and test reports are issued for this model?",
              "Who commissions and services it in my state, and are spares stocked in India?",
              "How does the system behave on my grid: voltage range, harmonics, neutral and earthing?",
              "What data and remote monitoring do I get?"
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "Nexera Powertech, an authorised partner of TCL and Hithium, supplies C&I battery storage across India with sizing, commissioning and service support. ",
              {
                "a": "Request a site assessment",
                "to": "/contact"
              },
              ", or ",
              {
                "a": "partner with us as an EPC company",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Request a site assessment or quotation",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Partner with us as an EPC company",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "What is C&I BESS?",
        "a": "Commercial and industrial battery energy storage: battery systems installed at businesses, factories and institutions to reduce power cost, provide backup and use solar better."
      },
      {
        "q": "How much does a commercial battery storage system cost in India?",
        "a": "It depends on capacity, brand, architecture and site works. Share your load data and bills for a quotation tailored to your project."
      },
      {
        "q": "What is the payback period of a C&I BESS?",
        "a": "It varies by site because it depends on tariff gap, demand charges, diesel replacement and cycling. Insist on a written estimate with assumptions."
      },
      {
        "q": "Can a BESS replace my diesel generator?",
        "a": "It can reduce generator running hours and cover short outages and peaks. Long outages or very large loads may still need a generator, which can be integrated with the BESS."
      },
      {
        "q": "Do I need solar to install a BESS?",
        "a": "No. Many businesses use grid-charged batteries for ToD and demand savings, but solar plus storage often improves the economics."
      },
      {
        "q": "Which Indian states are suitable for C&I BESS?",
        "a": "Any state where your tariff has ToD slots, demand charges or frequent outages can benefit. Nexera supplies across India."
      }
    ],
    "related": [
      {
        "label": "C&I battery storage",
        "to": "/solutions/commercial-industrial"
      },
      {
        "label": "ToD tariff in Karnataka",
        "to": "/blog/tod-tariff-karnataka-battery-storage"
      },
      {
        "label": "Peak shaving with BESS",
        "to": "/blog/peak-shaving-demand-charges-bess"
      },
      {
        "label": "Solar plus storage for EPC companies",
        "to": "/blog/solar-plus-storage-zero-export-epc-guide"
      },
      {
        "label": "TCL BlueArk X5",
        "to": "/products/tcl-blueark-x5"
      },
      {
        "label": "TCL BlueArk W10",
        "to": "/products/tcl-blueark-w10"
      },
      {
        "label": "Hithium",
        "to": "/partners/hithium"
      }
    ]
  },
  "tod-tariff-karnataka-battery-storage": {
    "lead": [
      {
        "b": "A time-of-day (ToD) tariff charges different rates for electricity at different hours. In Karnataka, HT commercial and industrial consumers already face higher charges in defined peak hours, and a battery storage system can charge when power is cheaper or comes from your own solar and discharge in those peak hours."
      },
      " The saving comes from the price gap, so the exact tariff in your latest bill is what matters."
    ],
    "sections": [
      {
        "id": "what-is-a-tod-tariff",
        "h2": "What is a ToD tariff?",
        "blocks": [
          {
            "p": [
              "A ToD tariff splits the day into slots, typically ",
              {
                "b": "peak"
              },
              ", ",
              {
                "b": "normal"
              },
              " and ",
              {
                "b": "solar (daytime) or off-peak"
              },
              " hours, and applies a different energy charge to each. The idea is to encourage consumers to move load away from the hours when the grid is under most stress."
            ]
          },
          {
            "p": [
              "At the national level, the Electricity (Rights of Consumers) Amendment Rules, 2023 require ToD tariffs for commercial and industrial consumers with a maximum demand of 10 kW and above. Under the rules, ",
              {
                "a": "solar-hour tariffs are set 10 to 20 per cent below the normal tariff while peak-hour tariffs are 10 to 20 per cent higher",
                "href": "https://www.energetica-india.net/news/government-amends-electricity-rules-and-introduces-tod-tariff"
              },
              ", with solar hours defined as an eight-hour window set by the State Commission. Peak hours cannot be longer than solar hours."
            ]
          }
        ]
      },
      {
        "id": "tod-in-karnataka",
        "h2": "ToD in Karnataka",
        "blocks": [
          {
            "p": [
              "The Karnataka Electricity Regulatory Commission (KERC) has applied ToD to HT consumers for several years. In its FY2024-25 order, KERC ",
              {
                "a": "introduced a morning peak from 6 am to 9 am in addition to the existing evening peak from 6 pm to 10 pm",
                "href": "https://www.saurenergy.com/solar-energy-news/kerc-revises-electricity-tariffs-reduces-power-charges"
              },
              ". KERC then approved a ",
              {
                "a": "three-year retail tariff for 2025-26, 2026-27 and 2027-28",
                "href": "https://www.theweek.in/wire-updates/national/2025/03/27/mes21-ka-electricity-tariff.html"
              },
              " for all distribution licensees (BESCOM, MESCOM, CESC Mysore, HESCOM and GESCOM), including a ",
              {
                "a": "30 paise per unit reduction in HT industrial energy charges in 2025-26",
                "href": "https://theprint.in/india/kerc-announces-major-power-tariff-cuts-for-businesses-homes/2568083"
              },
              "."
            ]
          },
          {
            "p": [
              "Tariff orders, ToD adders and demand charges are revised from time to time, and licensees can also recover true-up amounts. ",
              {
                "b": "Always take the peak, normal and off-peak rates from your latest bill or the current KERC order for your ESCOM before sizing a battery."
              }
            ]
          },
          {
            "small": "Tariffs change; always check your latest bill and the current KERC order."
          }
        ]
      },
      {
        "id": "how-a-battery-uses-the-tariff-gap",
        "h2": "How a battery uses the tariff gap",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Charge"
                },
                " during the cheaper window: from your rooftop solar in the day, or from the grid in off-peak hours, subject to your tariff slots."
              ],
              [
                {
                  "b": "Discharge"
                },
                " during the peak slots, so the factory draws less from the grid when units are most expensive."
              ],
              [
                {
                  "b": "Repeat"
                },
                " every working day. The annual saving scales with how many kWh you shift and how large the price gap is."
              ]
            ]
          },
          {
            "figure": {
              "id": "tod-day"
            }
          },
          {
            "p": [
              "A system with 0.5P rating, such as the 125 kW / 261 kWh ",
              {
                "a": "TCL BlueArk W10",
                "to": "/products/tcl-blueark-w10"
              },
              ", can deliver its rated power for about two hours, which suits a part of the evening peak. Four-hour peak windows are served by larger energy capacity, by two cabinets, or by a 0.25P block."
            ]
          }
        ]
      },
      {
        "id": "illustrative-savings-hypothetical",
        "h2": "Illustrative savings (hypothetical)",
        "blocks": [
          {
            "p": [
              "Suppose a battery shifts 200 kWh into the peak slot on 300 working days a year, which is 60,000 kWh. The gross saving depends on the ",
              {
                "b": "net price gap"
              },
              " per kWh, meaning the peak rate minus the effective cost of the energy used to charge, including losses."
            ]
          },
          {
            "data": {
              "cols": [
                "Net gap (₹ per kWh)",
                "Annual saving before O&M"
              ],
              "rows": [
                [
                  "₹1",
                  "₹60,000"
                ],
                [
                  "₹2",
                  "₹1,20,000"
                ],
                [
                  "₹3",
                  "₹1,80,000"
                ],
                [
                  "₹4",
                  "₹2,40,000"
                ]
              ],
              "note": "Illustrative only: 200 kWh shifted on 300 working days (60,000 kWh a year). Not a prediction."
            }
          },
          {
            "p": "These are not predictions. They show how the result scales with the price gap and with how often the battery cycles. Your own bills decide where you sit in the table, and the battery's cost, life and degradation decide the payback. Demand-charge savings from peak shaving may add to this where your load profile allows."
          }
        ]
      },
      {
        "id": "charging-from-solar-makes-the-gap-wider",
        "h2": "Charging from solar makes the gap wider",
        "blocks": [
          {
            "p": [
              "The cheapest energy for charging is often your own solar. A rooftop or ground-mounted plant can charge the battery through the day, and the stored energy then displaces peak-slot grid purchases. An all-in-one hybrid cabinet such as the ",
              {
                "a": "TCL BlueArk X5",
                "to": "/products/tcl-blueark-x5"
              },
              " combines a PV inverter, PCS and battery, which can simplify this on new projects. ",
              {
                "a": "See solar plus storage",
                "to": "/blog/solar-plus-storage-zero-export-epc-guide"
              },
              "."
            ]
          }
        ]
      },
      {
        "id": "checklist-before-you-decide",
        "h2": "Checklist before you decide",
        "blocks": [
          {
            "ul": [
              "Which ToD slots and rates apply to your tariff category today?",
              "What are your peak-slot kWh on a typical working day (from interval data)?",
              "Do you have solar, or enough off-peak hours to recharge?",
              "How many days a year will the battery cycle?",
              "What are your demand charge and contract demand?",
              "Is there space and safe access for an outdoor cabinet?"
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "Send your latest HT bill and a month of interval data, and Nexera will check whether a ToD-led battery makes sense for your site. ",
              {
                "a": "Request a ToD savings check",
                "to": "/contact"
              },
              " or ",
              {
                "a": "partner with Nexera as an EPC company",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Send your bill for a ToD savings check",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Partner with Nexera as an EPC company",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "What is ToD tariff in Karnataka?",
        "a": "It is a tariff structure set by KERC in which HT consumers pay different energy rates at different hours, including defined morning and evening peak periods."
      },
      {
        "q": "What are the peak hours for HT industry in Karnataka?",
        "a": "KERC's FY2024-25 order set a morning peak of 6 am to 9 am and an evening peak of 6 pm to 10 pm. Check your latest bill for the slots and adders that apply now."
      },
      {
        "q": "Can a battery really reduce my BESCOM bill?",
        "a": "It can reduce energy cost by shifting consumption out of peak slots and may reduce demand charges. The amount depends on your tariff gap, load and operating pattern."
      },
      {
        "q": "Is battery storage worth it for a small factory in Bengaluru?",
        "a": "It can be, where peak-slot consumption is meaningful and solar or off-peak charging is available. A sizing check on your interval data will show it."
      },
      {
        "q": "Do I need solar to benefit from ToD with a battery?",
        "a": "No, but solar usually lowers the charging cost and widens the saving."
      },
      {
        "q": "Does the same logic apply in other states?",
        "a": "Yes. ToD rules apply nationally and states set their own slots and rates. Nexera supplies across India."
      }
    ],
    "related": [
      {
        "label": "Peak shaving with BESS",
        "to": "/blog/peak-shaving-demand-charges-bess"
      },
      {
        "label": "C&I BESS in India",
        "to": "/blog/commercial-industrial-bess-india-guide"
      },
      {
        "label": "How a BESS is designed and sized",
        "to": "/blog/how-bess-is-designed-and-sized"
      },
      {
        "label": "C&I battery storage",
        "to": "/solutions/commercial-industrial"
      },
      {
        "label": "Talk to our team",
        "to": "/contact"
      }
    ]
  },
  "peak-shaving-demand-charges-bess": {
    "lead": [
      {
        "b": "Peak shaving means using a battery to supply part of your load during your highest-demand moments so that the maximum demand recorded by the utility meter is lower."
      },
      " Because many HT tariffs bill a monthly demand charge on maximum demand, a few short spikes can raise the whole month's bill. A battery that covers those spikes can reduce the charge."
    ],
    "sections": [
      {
        "id": "how-demand-charges-work",
        "h2": "How demand charges work",
        "blocks": [
          {
            "p": "HT commercial and industrial consumers in India usually pay two main components:"
          },
          {
            "ul": [
              [
                {
                  "b": "Energy charges"
                },
                " for the units (kWh) consumed, possibly with ToD adders"
              ],
              [
                {
                  "b": "Demand or fixed charges"
                },
                " in rupees per kVA per month, applied to a ",
                {
                  "b": "billing demand"
                }
              ]
            ]
          },
          {
            "p": "The meter records your maximum demand (MD) in kVA over fixed intervals set by your tariff. Billing demand is commonly the higher of the recorded MD or a stated percentage of your contract demand, so check how your own tariff order defines it. Karnataka's regulator, for example, has revised demand charges and billing demand provisions in its recent orders, which shows why you should work from the current order for your state and category."
          },
          {
            "p": [
              "The key point: ",
              {
                "b": "a single 15 to 30 minute spike, often caused by simultaneous motor starts, compressors, furnaces, welding or EV chargers, can set the demand charge for the whole month."
              }
            ]
          }
        ]
      },
      {
        "id": "how-a-battery-shaves-the-peak",
        "h2": "How a battery shaves the peak",
        "blocks": [
          {
            "ul": [
              "The EMS watches your site load in real time.",
              [
                "You set a ",
                {
                  "b": "demand limit"
                },
                " (the threshold you want to stay under)."
              ],
              "When load would exceed the limit, the battery discharges just enough to hold grid demand at the limit.",
              "When load falls, the battery recharges from the grid or from solar."
            ]
          },
          {
            "figure": {
              "id": "peak-shave"
            }
          },
          {
            "p": [
              "The battery does not cut the factory's consumption; it changes what the ",
              {
                "b": "utility meter sees"
              },
              "."
            ]
          }
        ]
      },
      {
        "id": "what-a-peak-shaving-battery-must-be-good-at",
        "h2": "What a peak-shaving battery must be good at",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Power (kW) matters more than energy (kWh):"
                },
                " most peaks are short, so you often need a high-power PCS with a modest battery."
              ],
              [
                {
                  "b": "Fast response:"
                },
                " a PCS reacts in milliseconds, far faster than a generator."
              ],
              [
                {
                  "b": "Reserve logic:"
                },
                " the EMS must keep enough charge in reserve for the next peak, otherwise one missed peak can undo a month of savings."
              ],
              [
                {
                  "b": "Accurate metering:"
                },
                " the system needs reliable load measurement at the right point."
              ]
            ]
          }
        ]
      },
      {
        "id": "worked-example-hypothetical-numbers",
        "h2": "Worked example (hypothetical numbers)",
        "blocks": [
          {
            "p": "A factory has a contract demand of 500 kVA. Its normal load is about 380 kVA, but a few times a month it reaches 450 kVA for up to 45 minutes."
          },
          {
            "ul": [
              "Target demand limit: 380 kVA",
              [
                "Power to shave: 450 − 380 = ",
                {
                  "b": "70 kVA"
                }
              ],
              [
                "Energy per event: about 70 kVA for 0.75 h, which is roughly ",
                {
                  "b": "53 kVAh"
                },
                " before losses and reserve"
              ]
            ]
          },
          {
            "p": "A 125 kW / 261 kWh cabinet has more than enough power and energy for this event. A smaller 50 kW / 100 kWh unit would cover 50 kW of it. If the demand charge in the tariff were, say, ₹300 per kVA per month (an assumed figure):"
          },
          {
            "formula": [
              "70 kVA × ₹300 per kVA per month × 12 months = ₹2,52,000 per year"
            ]
          },
          {
            "p": "This is only a demonstration. Your tariff's demand charge, billing-demand floor and real peaks will decide the result. Note that if your billing demand has a floor based on a percentage of contract demand, shaving below that floor brings no extra saving, which is why interval data matters."
          }
        ]
      },
      {
        "id": "peak-shaving-plus-tod-stacking-the-benefits",
        "h2": "Peak shaving plus ToD: stacking the benefits",
        "blocks": [
          {
            "p": "The same battery can often do both: shave short demand peaks and shift energy into the peak-rate hours. The EMS needs clear priorities, because discharging for ToD can leave less charge for an unexpected demand spike. Many sites reserve part of the battery for peak shaving and use the rest for ToD shifting."
          }
        ]
      },
      {
        "id": "capacity-relief-avoiding-a-transformer-upgrade",
        "h2": "Capacity relief: avoiding a transformer upgrade",
        "blocks": [
          {
            "p": "If a site's transformer or connection is near its limit, a battery can supply the extra load in short bursts. This can postpone an expensive upgrade in some situations, but it needs a proper study of the load and the approvals."
          }
        ]
      },
      {
        "id": "power-factor-and-kva",
        "h2": "Power factor and kVA",
        "blocks": [
          {
            "p": [
              "Demand is billed in kVA, which includes reactive power. A BESS PCS can supply or absorb some reactive power, within limits. The ",
              {
                "a": "TCL W10",
                "to": "/products/tcl-blueark-w10"
              },
              " lists a power factor range of 1 leading to 1 lagging, while the X5 operates within 0.8 lagging to 0.8 leading, so loads with poor power factor may need correction as well."
            ]
          }
        ]
      },
      {
        "id": "is-peak-shaving-right-for-you",
        "h2": "Is peak shaving right for you?",
        "blocks": [
          {
            "p": [
              "You are a good candidate if your load has ",
              {
                "b": "short, sharp peaks well above your average"
              },
              ", you pay a significant demand charge, and your billing demand is not fixed by a high percentage floor. Flat, continuous loads benefit less from peak shaving."
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "Share your bills and interval data and Nexera will test whether peak shaving, ToD shifting or both make sense for your site. ",
              {
                "a": "Request an assessment",
                "to": "/contact"
              },
              " or ",
              {
                "a": "become a Nexera EPC partner",
                "to": "/become-a-partner"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Share your interval data for a peak-shaving assessment",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Become a Nexera EPC partner",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "What is peak shaving?",
        "a": "Reducing the maximum demand drawn from the grid by supplying part of the load from a battery during peaks."
      },
      {
        "q": "How does a battery reduce demand charges?",
        "a": "By discharging when load would exceed a set limit, so the meter records a lower maximum demand."
      },
      {
        "q": "How big a battery do I need for peak shaving?",
        "a": "It depends on how much demand you want to cut (kW) and for how long (kWh). Interval data at 15-minute resolution shows both."
      },
      {
        "q": "Can a battery do peak shaving and ToD savings together?",
        "a": "Yes, with the EMS configured to reserve capacity for demand peaks and use the rest for time-of-day shifting."
      },
      {
        "q": "Will peak shaving reduce my total energy consumption?",
        "a": "No. It reduces the peak demand billed, not the total kWh your plant uses."
      },
      {
        "q": "What data does Nexera need for a peak-shaving assessment?",
        "a": "Twelve months of bills and interval load data, your contract demand and tariff category, and a single-line diagram."
      }
    ],
    "related": [
      {
        "label": "ToD tariff in Karnataka",
        "to": "/blog/tod-tariff-karnataka-battery-storage"
      },
      {
        "label": "C&I BESS in India",
        "to": "/blog/commercial-industrial-bess-india-guide"
      },
      {
        "label": "How a BESS is designed and sized",
        "to": "/blog/how-bess-is-designed-and-sized"
      },
      {
        "label": "TCL BlueArk W10",
        "to": "/products/tcl-blueark-w10"
      },
      {
        "label": "TCL BlueArk X5",
        "to": "/products/tcl-blueark-x5"
      },
      {
        "label": "Talk to our team",
        "to": "/contact"
      }
    ]
  },
  "solar-plus-storage-zero-export-epc-guide": {
    "lead": [
      {
        "b": "Adding battery storage to a solar proposal lets an EPC company answer the questions that currently cost it projects: what if the customer cannot export, what about the evening peak tariff, what about backup, and what about diesel."
      },
      " A solar plant alone generates only in daylight; solar plus storage turns that energy into something the customer can use when they need it."
    ],
    "sections": [
      {
        "id": "where-solar-only-proposals-lose",
        "h2": "Where solar-only proposals lose",
        "blocks": [
          {
            "data": {
              "cols": [
                "Customer concern",
                "Why solar alone falls short",
                "How storage helps"
              ],
              "rows": [
                [
                  "DISCOM caps or blocks export",
                  "The array is sized down to the daytime load, or output is cut",
                  "Surplus charges the battery instead of being curtailed"
                ],
                [
                  "Highest tariff is in the evening",
                  "Solar output is near zero after sunset",
                  "Battery discharges into the peak slot"
                ],
                [
                  "Outages disrupt operations",
                  "A grid-tied solar inverter shuts down when the grid fails",
                  "A BESS with backup capability keeps critical loads on"
                ],
                [
                  "High diesel generator running cost",
                  "Solar cannot run during an outage",
                  "Battery covers short outages and reduces generator hours"
                ],
                [
                  "Tariff includes demand charges",
                  "Solar may not reduce short evening or cloudy-day peaks",
                  "Battery can cover peaks"
                ]
              ]
            }
          }
        ]
      },
      {
        "id": "zero-export-and-export-limited-sites",
        "h2": "Zero-export and export-limited sites",
        "blocks": [
          {
            "p": [
              "Many rooftop and ground-mounted C&I plants must keep export at zero, or under a cap, as a condition of the DISCOM approval. Without storage, the plant either shrinks or the inverter throttles on sunny days. With storage, the controller sends surplus to the battery and releases it later. The result is that you can ",
              {
                "b": "quote the full array size"
              },
              " the roof or land supports instead of cutting it to the minimum load."
            ]
          },
          {
            "figure": {
              "id": "zero-export"
            }
          },
          {
            "p": "This requires a proper zero-export control scheme: metering at the point of common coupling, fast control between the PV inverter and the battery, and settings that match the DISCOM's approval conditions."
          }
        ]
      },
      {
        "id": "which-system-to-use-ac-coupled-or-hybrid",
        "h2": "Which system to use: AC-coupled or hybrid?",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Existing solar plant:"
                },
                " add an AC-coupled battery cabinet, such as the ",
                {
                  "a": "TCL BlueArk W10",
                  "to": "/products/tcl-blueark-w10"
                },
                " (125 kW / 261 kWh)."
              ],
              [
                {
                  "b": "New solar plus storage project:"
                },
                " consider a hybrid, DC-coupled cabinet such as the ",
                {
                  "a": "TCL BlueArk X5",
                  "to": "/products/tcl-blueark-x5"
                },
                ", which combines a 50 kW PCS, a 100 kWh LFP battery and a PV inverter for up to 100 kWp in one cabinet. Up to ten cabinets can be paralleled for 500 kW / 1 MWh."
              ]
            ]
          },
          {
            "p": [
              "Read the full comparison in ",
              {
                "a": "DC-coupled vs AC-coupled vs hybrid BESS",
                "to": "/blog/dc-coupled-vs-ac-coupled-vs-hybrid-bess"
              },
              "."
            ]
          }
        ]
      },
      {
        "id": "backup-and-generator-integration",
        "h2": "Backup and generator integration",
        "blocks": [
          {
            "p": "For customers who want to reduce diesel use, look for a system with a fast transfer, grid-forming ability and a generator input. The X5 datasheet, for instance, lists on/off-grid switching within 20 ms, black start without grid or sun, and a generator input of up to 138 kW. Backup design needs a critical-load list, correct neutral and earthing, surge protection on the backup output and a 4-pole transfer switch where the manufacturer specifies it."
          }
        ]
      },
      {
        "id": "sizing-a-solar-plus-storage-system",
        "h2": "Sizing a solar plus storage system",
        "blocks": [
          {
            "ul": [
              [
                {
                  "b": "Start with the customer's goal:"
                },
                " zero-export, evening peak, backup or a mix."
              ],
              [
                {
                  "b": "Get interval data"
                },
                " so that you can see daytime surplus and evening demand."
              ],
              [
                {
                  "b": "Size the array"
                },
                " to the roof or land and the export condition."
              ],
              [
                {
                  "b": "Size the battery"
                },
                " to the energy you want to shift (kWh) and the power you need (kW). See ",
                {
                  "a": "How a BESS is designed and sized",
                  "to": "/blog/how-bess-is-designed-and-sized"
                },
                "."
              ],
              [
                {
                  "b": "Check charging hours:"
                },
                " the battery needs enough solar or off-peak hours to refill every day."
              ],
              [
                {
                  "b": "Check the site:"
                },
                " space, plinth, cable routes, ambient temperature, internet connectivity."
              ]
            ]
          }
        ]
      },
      {
        "id": "common-mistakes-to-avoid",
        "h2": "Common mistakes to avoid",
        "blocks": [
          {
            "ul": [
              "Sizing the battery without interval data",
              "Ignoring neutral-to-earth voltage, harmonics or surge protection at the site",
              "Leaving out internet connectivity, which manufacturers use for monitoring and, in some cases, warranty terms",
              "Letting uncertified teams commission the system, which can affect the warranty",
              "Promising a fixed saving instead of a calculation with stated assumptions"
            ]
          }
        ]
      },
      {
        "id": "what-epc-companies-should-expect-from-a-bess-supplier",
        "h2": "What EPC companies should expect from a BESS supplier",
        "blocks": [
          {
            "p": "The hardware is only part of the offer. A supplier worth partnering with provides:"
          },
          {
            "ul": [
              [
                {
                  "b": "Sizing and single-line diagram"
                },
                " support for each project"
              ],
              [
                {
                  "b": "Commissioning"
                },
                " or supervised commissioning"
              ],
              [
                {
                  "b": "Installer training and certification"
                },
                ", because manufacturers such as TCL tie warranty to certified or authorised installers"
              ],
              [
                {
                  "b": "India spares stock"
                },
                " and fast response on faults"
              ],
              [
                {
                  "b": "Warranty registration and claim handling"
                },
                " with the manufacturer"
              ],
              [
                {
                  "b": "Remote diagnostics"
                },
                " from system data"
              ]
            ]
          },
          {
            "p": "This is the model Nexera Powertech follows as an authorised partner of TCL and Hithium. You sell and install to your customer; Nexera supports the equipment, design and service behind it."
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              "If you are a solar EPC company or installer, ",
              {
                "a": "become a Nexera partner",
                "to": "/become-a-partner"
              },
              " and get sizing support, training and India spares for your next solar-plus-storage project. End customers can ",
              {
                "a": "request a site assessment",
                "to": "/contact"
              },
              "."
            ]
          },
          {
            "actions": [
              {
                "label": "Become a Nexera partner",
                "to": "/become-a-partner",
                "primary": true
              },
              {
                "label": "Request EPC sizing support",
                "to": "/contact"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "Can I add a battery to a solar plant I already installed?",
        "a": "Usually yes, with an AC-coupled battery. The design depends on the inverter, the point of connection and the DISCOM's rules."
      },
      {
        "q": "What is zero-export solar?",
        "a": "A solar plant configured so that no power flows back to the grid. Any surplus must be consumed on site or stored in a battery."
      },
      {
        "q": "Does a solar inverter work during a power cut?",
        "a": "A standard grid-tied inverter shuts down when the grid fails, for safety. A hybrid or battery system with backup capability can keep loads running."
      },
      {
        "q": "How can an EPC company become a Nexera partner or distributor?",
        "a": "Contact Nexera through the partner page. We onboard EPC partners with product training, sizing support and certification."
      },
      {
        "q": "Which brands does Nexera offer for EPC projects?",
        "a": "Nexera supplies TCL and Hithium battery storage, from C&I cabinets to utility-scale blocks."
      },
      {
        "q": "Do I need approvals for adding storage?",
        "a": "Yes, requirements vary by DISCOM and state. Nexera's team can help you prepare the technical documents."
      }
    ],
    "related": [
      {
        "label": "DC vs AC vs hybrid BESS",
        "to": "/blog/dc-coupled-vs-ac-coupled-vs-hybrid-bess"
      },
      {
        "label": "How a BESS is designed and sized",
        "to": "/blog/how-bess-is-designed-and-sized"
      },
      {
        "label": "TCL BlueArk X5",
        "to": "/products/tcl-blueark-x5"
      },
      {
        "label": "Hithium",
        "to": "/partners/hithium"
      },
      {
        "label": "Become a partner",
        "to": "/become-a-partner"
      }
    ]
  },
  "tcl-blueark-hithium-bess-solutions-india": {
    "lead": [
      {
        "b": "Nexera Powertech is an authorised partner of TCL and Hithium in India, supplying battery storage from all-in-one C&I cabinets to containerised utility-scale blocks."
      },
      " TCL BlueArk systems use LFP (lithium iron phosphate) cells, and Nexera adds the sizing, commissioning, training, spares and warranty support that Indian projects need."
    ],
    "sections": [
      {
        "id": "the-range-at-a-glance",
        "h2": "The range at a glance",
        "blocks": [
          {
            "data": {
              "cols": [
                "Segment",
                "Product",
                "Headline specification (from manufacturer documents)",
                "Best suited to"
              ],
              "rows": [
                [
                  "C&I",
                  [
                    {
                      "a": "TCL BlueArk X5-50K-100",
                      "to": "/products/tcl-blueark-x5"
                    }
                  ],
                  "50 kW AC, 100 kWh LFP, PV input up to 100 kWp in one cabinet; up to 10 cabinets in parallel",
                  "New solar plus storage, backup, ToD shifting"
                ],
                [
                  "C&I",
                  [
                    {
                      "a": "TCL BlueArk W10",
                      "to": "/products/tcl-blueark-w10"
                    }
                  ],
                  "125 kVA / 261 kWh, 314 Ah LFP cells, liquid cooling, IP55, 8000 cycles to 70% SOH, 95% DoD",
                  "Peak shaving, ToD shifting, AC-coupled retrofit"
                ],
                [
                  "C&I / small utility",
                  [
                    {
                      "a": "Hithium ∞Power 1022 kWh Cabinet",
                      "to": "/products/hithium-power-cabinet-1022"
                    }
                  ],
                  "1,022 kWh, liquid cooling; battery, thermal management and control in one cabinet; 400 Vac, compatible with various PCS models",
                  "Larger C&I and MWh-class projects"
                ],
                [
                  "Utility-scale",
                  [
                    {
                      "a": "Hithium ∞Power 6.25 MWh",
                      "to": "/products/hithium-power-625"
                    }
                  ],
                  "6,250 kWh in a 20-foot container, 2-hour (0.5P) or 4-hour (0.25P), liquid cooling, IP55",
                  "Grid-scale and solar-park storage"
                ]
              ]
            }
          },
          {
            "figure": {
              "id": "range-by-size"
            }
          },
          {
            "p": [
              "TCL also offers residential storage, which suits the ",
              {
                "a": "home battery storage",
                "to": "/solutions/residential"
              },
              " segment."
            ]
          }
        ]
      },
      {
        "id": "tcl-blueark-x5-the-all-in-one-hybrid",
        "h2": "TCL BlueArk X5: the all-in-one hybrid",
        "blocks": [
          {
            "p": "The X5 is built for EPC companies that want fewer boxes on site. One cabinet combines a 50 kW power conversion system, a 100 kWh LiFePO4 battery and a PV inverter for up to 100 kWp with six MPPTs. The datasheet lists on/off-grid switching within 20 ms, black start without grid or sun, a generator input up to 138 kW, and operating temperature from −30 to 50 °C with derating from 45 °C. It uses a transformer-less design, with battery protection at IP55 and inverter protection at IP66."
          },
          {
            "p": "TCL has confirmed specific behaviours on Indian grid conditions, such as phase-loss and neutral-loss disconnection, and gives site requirements for neutral-earth voltage and earthing. Nexera uses these in its project checks."
          }
        ]
      },
      {
        "id": "tcl-blueark-w10-liquid-cooled-261-kwh-cabinet",
        "h2": "TCL BlueArk W10: liquid-cooled 261 kWh cabinet",
        "blocks": [
          {
            "p": [
              "The W10 is an outdoor C&I cabinet with 125 kVA rated power (138 kVA maximum), 400 V three-phase output, 314 Ah LFP cells in a 1P260S configuration and intelligent liquid cooling. Cabinets can be paralleled from 261 kWh up to about 6.3 MWh. With its own AC output it fits ",
              {
                "b": "AC-coupled"
              },
              " retrofit projects as well as grid-charged ToD and demand-charge applications."
            ]
          }
        ]
      },
      {
        "id": "hithium-candi-cabinet-and-power-blocks",
        "h2": "Hithium ∞Power 1022 kWh Cabinet and 6.25 MWh",
        "blocks": [
          {
            "p": [
              "The ",
              {
                "a": "Hithium ∞Power 1022 kWh Cabinet",
                "to": "/products/hithium-power-cabinet-1022"
              },
              " integrates the battery, thermal management and control in one liquid-cooled cabinet. It connects at 400 Vac and works with various PCS models, for grid-tied, off-grid and solar-storage hybrid applications."
            ]
          },
          {
            "p": [
              "For utility-scale projects, the ",
              {
                "a": "Hithium ∞Power 6.25 MWh",
                "to": "/products/hithium-power-625"
              },
              " fits a 20-foot container and comes in 2-hour (0.5P) and 4-hour (0.25P) configurations."
            ]
          }
        ]
      },
      {
        "id": "what-the-tcl-warranty-looks-like",
        "h2": "What the TCL warranty looks like",
        "blocks": [
          {
            "p": "Under TCL's Limited Warranty V1.3 for the X5, issued in October 2026 and now listing India as an applicable country, battery packs are covered for 10 years, with a performance guarantee of at least 70% of initial usable energy up to the earlier of 10 years or a stated energy throughput. Hybrid inverter, EMS and related electrical parts carry 5 years, and other parts carry shorter terms. The warranty depends on installation by a TCL-certified or authorised installer or distributor and an internet connection within three months. Read the full terms for the model you buy."
          }
        ]
      },
      {
        "id": "which-product-should-i-choose",
        "h2": "Which product should I choose?",
        "blocks": [
          {
            "data": {
              "cols": [
                "Your situation",
                "Suggested direction"
              ],
              "rows": [
                [
                  "New factory rooftop solar with backup and ToD needs",
                  "TCL BlueArk X5 (hybrid, one cabinet)"
                ],
                [
                  "Existing solar plant, add storage",
                  "TCL BlueArk W10 (AC-coupled)"
                ],
                [
                  "Peak shaving or ToD only, no solar",
                  "TCL BlueArk W10"
                ],
                [
                  "Multi-MWh C&I or utility project",
                  "Hithium ∞Power 1022 kWh Cabinet or ∞Power 6.25 MWh"
                ]
              ]
            }
          },
          {
            "p": "The final choice depends on your load, tariff, site and budget, so ask for a sizing check."
          }
        ]
      },
      {
        "id": "what-nexera-adds",
        "h2": "What Nexera adds",
        "blocks": [
          {
            "ul": [
              "Sizing check and single-line diagram for each project",
              "Supply with India spares stock",
              "Commissioning or supervised commissioning",
              "Installer training and certification",
              "Warranty registration and claim filing with the manufacturer",
              "Remote diagnostics support"
            ]
          }
        ]
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera",
        "blocks": [
          {
            "p": [
              {
                "a": "Request a quotation",
                "to": "/contact"
              },
              " for TCL or Hithium battery storage, or ",
              {
                "a": "become a Nexera partner",
                "to": "/become-a-partner"
              },
              " to offer solar plus storage to your customers across India."
            ]
          },
          {
            "actions": [
              {
                "label": "Request a quotation",
                "to": "/contact",
                "primary": true
              },
              {
                "label": "Become a Nexera partner",
                "to": "/become-a-partner"
              }
            ]
          }
        ]
      }
    ],
    "faqs": [
      {
        "q": "Is TCL battery storage available in India?",
        "a": "Yes. Nexera Powertech is an authorised TCL partner supplying BlueArk C&I systems in India with design and service support."
      },
      {
        "q": "Is Hithium available in India?",
        "a": "Yes. Nexera is also an authorised Hithium partner for C&I and utility-scale storage."
      },
      {
        "q": "What is the difference between TCL BlueArk X5 and W10?",
        "a": "The X5 is a hybrid all-in-one 50 kW / 100 kWh cabinet with a built-in PV inverter. The W10 is a 125 kVA / 261 kWh liquid-cooled cabinet that connects on the AC side."
      },
      {
        "q": "What battery chemistry do these systems use?",
        "a": "TCL BlueArk systems use LFP (lithium iron phosphate) cells. Check the exact specification on each product page."
      },
      {
        "q": "What certifications do the products carry?",
        "a": "Certification varies by model and region, and some are issued at different dates. Ask Nexera for the issued certificates and test reports for the exact model you are buying."
      },
      {
        "q": "How can I become a distributor or EPC partner?",
        "a": "Contact Nexera through the partner page. We train and support EPC companies across India."
      }
    ],
    "related": [
      {
        "label": "TCL BlueArk X5",
        "to": "/products/tcl-blueark-x5"
      },
      {
        "label": "TCL BlueArk W10",
        "to": "/products/tcl-blueark-w10"
      },
      {
        "label": "Hithium",
        "to": "/partners/hithium"
      },
      {
        "label": "Hithium ∞Power 1022 kWh Cabinet",
        "to": "/products/hithium-power-cabinet-1022"
      },
      {
        "label": "Hithium ∞Power 6.25 MWh",
        "to": "/products/hithium-power-625"
      },
      {
        "label": "C&I battery storage",
        "to": "/solutions/commercial-industrial"
      },
      {
        "label": "Utility-scale BESS",
        "to": "/solutions/utility-scale"
      },
      {
        "label": "Become a partner",
        "to": "/become-a-partner"
      }
    ]
  }
};
