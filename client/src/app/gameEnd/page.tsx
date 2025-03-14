"use client";

import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSocket } from "@/context/SocketContext"; // Import the socket context
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Separate component for the main content
function GameEndContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const socket = useSocket();  // Access the global socket
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const roomCode = searchParams.get("roomCode") || "";
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); // Set to true once the component is mounted on the client side
    }, []);

    useEffect(() => {
        if (!roomCode || !isClient) return;

        // Listen for the leaderboard data from the server
        socket?.on("leaderboard", (data) => {
            setLeaderboard(data);  // Update leaderboard state with the received data
        });

        // Emit event to get leaderboard when the component mounts
        socket?.emit("get-leaderboard", roomCode);

        // Cleanup the event listener on component unmount
        return () => {
            socket?.off("leaderboard");
        };
    }, [socket, roomCode, isClient]);

    const handleGoBack = () => {
        socket?.emit("leave-room", roomCode);
        router.push('/');
    };

    if (!isClient) {
        return <div>Loading...</div>; // Render loading state until the component mounts on the client
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 py-8">
                <Card className="w-full max-w-md mx-auto bg-gray-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Game Over</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-white">Rank</TableHead>
                                    <TableHead className="text-white">Player</TableHead>
                                    <TableHead className="text-white text-right">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((entry, index) => (
                                    <TableRow key={entry.name}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{entry.name}</TableCell>
                                        <TableCell className="text-right">{entry.score}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-center pt-4">
                            <Button variant="default" size="lg" onClick={handleGoBack}>
                                Go Back to Lobby
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Main page component
export default function GameEndPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GameEndContent />
        </Suspense>
    );
}