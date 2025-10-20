'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { SavedUid } from "@/lib/data";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { userProfile } from "@/lib/data";
import { Label } from "./ui/label";

export default function SavedUidsCard() {
    const [uids, setUids] = useState<SavedUid[]>(userProfile.savedUids);
    const [newGame, setNewGame] = useState('');
    const [newUid, setNewUid] = useState('');

    const handleAddUid = () => {
        if (newGame && newUid) {
            setUids([...uids, { game: newGame, uid: newUid }]);
            setNewGame('');
            setNewUid('');
        }
    };

    const handleRemoveUid = (index: number) => {
        setUids(uids.filter((_, i) => i !== index));
    };
    
    return (
        <div className="pt-2">
            <CardDescription className="mb-4">Manage your frequently used game IDs for faster checkout.</CardDescription>
            <div className="space-y-3">
                {uids.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                        <div className="flex-grow">
                            <p className="font-semibold">{item.game}</p>
                            <p className="text-sm text-muted-foreground font-mono">{item.uid}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveUid(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>
             <div className="mt-4 pt-4 border-t space-y-4">
                <p className="font-medium">Add New UID</p>
                <div className="space-y-2">
                    <Label htmlFor="new-game-name">Game Name</Label>
                    <Input id="new-game-name" placeholder="e.g. Free Fire" value={newGame} onChange={(e) => setNewGame(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="new-game-uid">Game UID</Label>
                    <Input id="new-game-uid" placeholder="Enter Game UID" value={newUid} onChange={(e) => setNewUid(e.target.value)} />
                </div>
                <Button onClick={handleAddUid} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add UID
                </Button>
            </div>
        </div>
    );
}