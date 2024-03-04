import React from 'react';
import {Box, Button, Flex, Heading, Text, Card, CardBody} from "@chakra-ui/react";
import axios from "axios";
import {SearchIcon} from '@chakra-ui/icons'
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {wrap} from "framer-motion";

function PassportPage(props) {

    const [cityHalls, setCityHalls] = React.useState([]);
    const [allWindows, setAllWindows] = React.useState([]);

    const [loading, setLoading] = React.useState(false);


    async function fetchBestWindows() {
        await fetchCityHalls();
        const allwindows = []
        console.log(cityHalls)

        for (const cityHall of cityHalls) {
            console.log("FETCHING WINDOWS FOR")
            let window = await fetchWindows(cityHall)
            console.log("BAKEL CITY GANGSTERR")
            console.log(window.slug)
            window.timeSlots.map((w, yindex) => {
                w.cityHall = cityHall.corporate_name
                w.slug = window.slug
            })

            allwindows.push(...window.timeSlots)
        }

        const list = []
        allwindows.map((windows, index) => {
            console.log(windows)
        })
        while (allwindows.length > 0) {
            let bestWindow = new Date(903903909999929)
            let bestCityHall
            let bestSlug
            let inde
            allwindows.map((windows, index) => {
                if (Date.parse(windows.start_date) < bestWindow) {
                    bestWindow = Date.parse(windows.start_date)
                    bestCityHall = windows.cityHall
                    bestSlug = windows.slug
                    console.log("aodaiodnaondoandioanidnaoidnoi")
                    console.log(windows.slug)
                    inde = index
                }
            });
            allwindows.splice(inde, 1)
            console.log(bestWindow)
            console.log(bestCityHall)
            list.push({name: bestCityHall, time: bestWindow,slug: bestSlug})
        }
        setAllWindows(list)
        console.log(allWindows)
    }

    async function fetchCityHalls() {
        const data = {
            "activity": {
                "displayed_name": "Passeport",
                "id": 35,
                "id_activity_domain": 31,
                "id_activity": 41,
                "activity_name": "CNI/Passeport",
                "type": "prestation",
                "name": "Passeport",
                "activity_domain_name": "Service Public"
            },
            "address": {
                "displayed_address": "Paris",
                "zip_code": "75000",
                "insee_code": "75100",
                "city": "Paris",
                "latitude": 48.866667,
                "longitude": 2.333333
            },
            "radius": 200,
            "sort": "date",
            "start_date": "2023-03-06T10:51:53.075Z",
            "number_slots": 1
        }
        console.log("Fetching city halls")

        axios.post('https://ws.synbird.com/v6/pro/company/search', data)
            .then(response => {
                setCityHalls(response.data)
            });


    }

    async function getProfessionalPlace(id) {
        const data =
            {"id_professional_company": id, "slug": null}

        let profplace
        let slug
        await axios.post('https://ws.synbird.com/v6/pro/company/get', data)
            .then(response => {
                console.log("Response: ")
                console.log(response.data)
                slug  = response.data.professional.slug
                profplace = response.data.professional.id_professional_place
            });
        return [profplace,slug]

    }

    async function fetchWindows(cityhall) {
        const res = await getProfessionalPlace(cityhall.id_professional_company)
        const profplace = res[0]
        const slug = res[1]
        const data =

            {
                "transaction_id": "1420_184892",
                "id_professional_company": cityhall.id_professional_company,
                "id_professional_agenda": null,
                "id_professional_prestation": cityhall.professional_prestation.id,
                "id_professional_place": [profplace],
                "source_type": "widget",
                "duration": 7,
                "number_slots": 1,
                "display_time_slots_as_range": false,
                "additional_informations_start": [{
                    "id": 23081,
                    "type": "nbpers",
                    "duration": 0,
                    "breadcrumb": "1 personne"
                }, {
                    "id": 25165,
                    "type": "radio",
                    "duration": 0,
                    "breadcrumb": "Uniquement majeur"
                }, {
                    "value": {
                        "city": cityhall.address.city,
                        "agglo": "city",
                        "radio": "true",
                        "zip_code": "81600",
                        "insee_code": "81099",
                        "label": cityhall.address.city,
                        "radiocityId": 23085
                    }, "type": "radiocity", "id": 23086, "breadcrumb": cityhall.address.city
                }, {"id": 23091, "type": "text", "value": {"value": null}, "breadcrumb": "Pré-demande"}]
            }
        let window

        await axios.post('https://ws.synbird.com/v6/pro/company/getSlotsFor', data)
            .then(response => {
                console.log("Response: ")
                console.log(response.data)
                window = response.data
                window.slug = slug
                console.log("WINDOW: ")
                console.log(window)
            });
        return window


    }

    return (
        <Flex direction={"column"} width={"100vw"} minHeight={"100vh"} alignItems={"center"}>
            <Heading mt={10}>Liste des passeports</Heading>
            <Text mt={1} color={"gray.500"}>Donne une liste des meilleurs créneaux disponible dans un rayon de 200km autour de Paris</Text>
            <Button isLoading={loading} mt={10} onClick={() => {
                setLoading(true)
                setAllWindows([])
                fetchBestWindows().then(() => {
                    setLoading(false)
                })}
            }>Rechercher</Button>
            <Flex alignItems={"center"} direction={"column"}>


                {
                    allWindows.length > 0 ?
                        <Box m={10}>
                            <Heading mb={10}>Meilleurs creneaux {allWindows.length}</Heading>

                            <Flex direction={"row"} flexWrap={"wrap"}>

                                {
                                    allWindows.map((windows, index) => {
                                        return <Card _hover={{cursor: "pointer"}} dropShadow={"0 0 0 0 2px"}  key={index} m={1}>
                                            <CardBody onClick={() =>  window.location.href = `https://app.synbird.com/${windows.slug}`}>
                                                <Text>{format(new Date(windows.time), "d MMMM", {locale: fr})}</Text>
                                                <Text>{windows.name}</Text>
                                            </CardBody>
                                        </Card>

                                    })
                                }

                            </Flex>
                        </Box>
                        : null
                }
            </Flex>
        </Flex>
    );
}

export default PassportPage;
