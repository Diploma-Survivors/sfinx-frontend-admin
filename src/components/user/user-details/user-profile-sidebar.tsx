import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/types/user';
import { format } from 'date-fns';
import {
    Calendar,
    Github,
    Globe,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Trophy,
} from 'lucide-react';

interface UserProfileSidebarProps {
    user: UserProfile;
}

export function UserProfileSidebar({ user }: UserProfileSidebarProps) {
    return (
        <Card className="shadow-lg border border-border bg-card">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <Avatar className="w-32 h-32 rounded-xl border-4 border-background shadow-md">
                        <AvatarImage src={user.avatarUrl} className="object-cover" />
                        <AvatarFallback className="rounded-xl">
                            <img
                                src="/avatars/placeholder.png"
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        {user.fullName}
                    </h2>
                    <p className="text-muted-foreground font-medium">@{user.username}</p>
                    <div className="mt-2 flex justify-center gap-2">
                        <Badge variant={user.isActive ? (user.isBanned ? 'destructive' : 'default') : 'secondary'}>
                            {!user.isActive ? 'Not Verified' : user.isBanned ? 'Banned' : 'Active'}
                        </Badge>
                        {user.isPremium && <Badge className="bg-gradient-to-r from-amber-500 to-amber-600">Premium</Badge>}
                    </div>
                </div>
                <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1"
                >
                    <Trophy className="w-3 h-3 mr-1" />
                    Rank {user.rank}
                </Badge>

                <div className="w-full space-y-3 pt-4 text-left">
                    {user.bio && (
                        <div className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-1 mb-4 break-words whitespace-pre-wrap">
                            {user.bio}
                        </div>
                    )}

                    {user.address && (
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-3 text-muted-foreground/70" />
                            <span className="text-sm truncate">{user.address}</span>
                        </div>
                    )}
                    {user.email && (
                        <div className="flex items-center text-muted-foreground">
                            <Mail className="w-4 h-4 mr-3 text-muted-foreground/70" />
                            <span className="text-sm truncate">{user.email}</span>
                        </div>
                    )}
                    {user.phone && (
                        <div className="flex items-center text-muted-foreground">
                            <Phone className="w-4 h-4 mr-3 text-muted-foreground/70" />
                            <span className="text-sm truncate">{user.phone}</span>
                        </div>
                    )}

                    {user.githubUsername && (
                        <a
                            href={`https://github.com/${user.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Github className="w-4 h-4 mr-3 text-muted-foreground/70" />
                            <span className="text-sm truncate">@{user.githubUsername}</span>
                        </a>
                    )}

                    {user.linkedinUrl && (
                        <a
                            href={user.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Linkedin className="w-4 h-4 mr-3 text-muted-foreground/70" />
                            <span className="text-sm truncate">LinkedIn</span>
                        </a>
                    )}

                    {user.websiteUrl && (
                        <a
                            href={user.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Globe className="w-4 h-4 mr-3 text-muted-foreground/70" />
                            <span className="text-sm truncate">Website</span>
                        </a>
                    )}

                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-3 text-muted-foreground/70" />
                        <span className="text-sm truncate">
                            Joined {user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
