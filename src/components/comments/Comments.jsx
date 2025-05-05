import { useContext, useEffect, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { rtdb } from "../../firebase";
import { ref, push, onValue, update } from "firebase/database";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { toast } from "react-toastify"; // For notifications (install react-toastify if not already)

const badWords = [
  "badword1", "badword2", "badword3", "idiot", "stupid", "dumb", "hate", "ugly", "fool", "nonsense", "shut up",
  "abuse", "abusive", "idiot", "stupid", "dumb", "moron", "fool", "hate", "loser", 
  "ugly", "trash", "nonsense", "jerk", "suck", "bastard", "retard", "piss", "shit",
  "damn", "asshole", "bitch", "crap", "fuck", "fucking", "foolish", "dumbass",
  "sucker", "nutcase", "psycho", "sicko", "weirdo", "fat", "pig", "cow", "dog", "rat",
  "clown", "noob", "failure", "worst", "garbage", "trashcan", "vomit", "barf", 
  "idiot", "stupid", "dumb", "ugly", "fool", "loser", "jerk", "nonsense",
  "hate", "trash", "garbage", "freak", "psycho", "moron", "suck", "worst",
  "annoying", "worthless", "bastard", "bitch", "slut", "whore", "damn",
  "asshole", "shit", "fuck", "motherfucker", "dick", "prick", "cock", "pussy",
  "retard", "lame", "crazy", "kill yourself", "kys", "fat", "disgusting", "creep",
  "crybaby", "backstabber", "bozo", "clown", "uglier", "crap", "smelly",
  "screw you", "bully", "dumbass", "sissy", "chicken", "coward", "crybaby",
  "brain-dead", "brain dead", "lazy", "liar", "cheater", "snake", "scum",
  "parasite", "jerkface", "useless", "low life", "bottom feeder", "dirty",
  "smelly", "stinky", "loserface", "fatso", "uggo", "dumbshit", "fucktard",
  "incompetent", "moronic", "pathetic", "wannabe", "nobody", "no one likes you",
  "everyone hates you", "go die", "kill yourself", "you suck", "idiotic",
  "piece of shit", "loserville", "slimy", "worm", "pest", "nuisance",
  "stupidhead", "jerkwad", "crud", "turd", "lowlife", "imbecile",
  "screwup", "fuckface", "douche", "douchebag", "scumbag", "asswipe",
  "shithole", "twat", "twatface", "shitty", "freakshow", "cunt",
  "piss off", "wanker", "tosser", "arsehole", "bugger", "bollocks",
  "git", "pillock", "knobhead", "minger", "prat", "twit",
  "gobshite", "spastic", "mong", "knob", "douchecanoe", "chav",
  "abuse", "abusive", "ass", "asshole", "bastard", "bitch", "crap", "cunt", "damn", "dick",
  "dumb", "faggot", "fool", "fuck", "fucking", "idiot", "jerk", "loser", "moron", "nonsense",
  "nutcase", "pig", "psycho", "piss", "rat", "retard", "shit", "shut up", "sicko", "slut",
  "sucker", "trash", "ugly", "vomit", "weirdo", "whore", "fat", "cow", "dog", "garbage",
  "failure", "noob", "trashcan", "barf", "nutjob", "douchebag", "jerkoff", "waste", "twat",
  "dipshit", "pansy", "prick", "jackass", "tool", "scrub", "shithead", "asswipe", "fuckface",
  "shitface", "shitbag", "sissy", "dumbass", "airhead", "assclown", "asshat", "shitstorm",
  "bitchface", "fatass", "chode", "fuckboy", "fuckgirl", "douche", "bootlicker", "dumbfuck",
  "fucked", "idiotic", "lowlife", "manwhore", "shitshow", "slutty", "smelly", "uggo", "thot",
  "wanker", "peasant", "worthless", "bimbo", "dimwit", "fuckwit", "nincompoop", "scumbag",
  "cocksucker", "motherfucker", "jackhole", "jerkwad", "sonofabitch", "asskisser", "bastardly",
  "ugliness", "moronic", "shitstain", "shitbird", "fuckhead", "creep", "deadbeat", "grifter",
  "manchild", "parasite", "reject", "scum", "shady", "trashheap", "wasteoid", "poser", "toolbag",
  "shitlord", "fucktard", "pissant", "toolbox", "worm", "bitchy", "backstabber", "gossip",
  "hypocrite", "phony", "snake", "traitor", "twit", "wastecase", "dirtbag", "gross", "imbecile",
  "lamebrain", "mudbrain", "ninny", "putz", "scatterbrain", "screwup", "simpleton", "weasel",
  "blockhead", "chump", "cretin", "dullard", "goon", "halfwit", "numbskull", "pinhead", "schmuck",
  "bonehead", "dunce", "doofus", "nitwit", "dork", "bozo", "airbrain", "meathead", "knucklehead",
  "sapsucker", "mouthbreather", "birdbrain", "bubblehead", "slowpoke", "clutz", "klutz", "dimwit",
  "dickweed", "fuckhole", "shitlicker", "ballsack", "butthead", "prickhead", "assmunch", "fucknut",
  "fuckface", "shitbrain", "twatwaffle", "cumstain", "cumdumpster", "assbucket", "analbead",
  "buttfucker", "dickless", "dumbshit", "fuckbag", "fuckstick",
  "abandon", "abandoned", "abandoner", "abandoning", "abandonment", "abnormal", "abuse", "abused", "abuser", "abusing", "abusive", "accident", "accursed", "accusation", "accuse", "accused", "accuser", "ache", "aching", "acrimonious", "acrimony", "adamant", "addict", "addicted", "addicting", "addicts", "admonish", "admonisher", "admonishing", "admonishment", "adulterate", "adulterated", "adulteration", "adulterer", "adultery", "adversary", "adverse", "adversity", "afflict", "affliction", "afflictive", "aggravate", "aggravated", "aggravates", "aggravating", "aggravation", "aggression", "aggressor", "aggrieve", "aggrieved", "agitate", "agitated", "agitation", "agitator", "agonize", "agonized", "agonizes", "agonizing", "agony", "alienate", "alienated", "alienates", "alienating", "alienation", "allege", "allegation", "allegations", "allergic", "aloof", "altercation", "amiss", "animosity", "annihilate", "annihilation", "anomalous", "anomaly", "antagonism", "antagonist", "antagonistic", "antagonize", "antagonized", "antagonizes", "anti", "antipathy", "antiquated", "anxieties", "anxiety", "anxious", "anxiously", "apathetic", "apathy", "appalling", "appallingly", "apprehension", "apprehensions", "apprehensive", "arbitrary", "arcane", "arduous", "argument", "arguments", "arrogance", "arrogant", "arrogantly", "ashamed", "asinine", "assail", "assailing", "assault", "assaulted", "assaulting", "assaults", "assertive", "asshole", "astray", "atrocious", "atrocity", "attack", "attacked", "attacker", "attacking", "attacks", "audacious", "audacity", "awkward", "awkwardness",
  "awful", "awfully", "awkward", "backward", "bad", "badly", "baffle", "baffled", "bafflement", "bait", "balk", "banal", "barbarian", "barbaric", "barbarism", "bash", "bashed", "bashes", "bashing", "bastard", "bastards", "battle", "beaten", "beatens", "beating", "begrudge", "belabor", "belated", "belie", "belied", "belittle", "belittled", "belittling", "belligerence", "belligerent", "belligerently", "bemused", "bemoan", "bemoaned", "bemoaning", "bemusement", "beneath", "berate", "berated", "bereave", "bereaved", "bereavement", "bereaving", "berserk", "beset", "besiege", "besmirch", "bestial", "betray", "betrayal", "betrayed", "betraying", "betrays", "bewail", "beware", "bewilder", "bewildered", "bewildering", "bewilderment", "biased", "biases", "bicker", "bickering", "bid-rigging", "bigot", "bigoted", "bigotry", "bitch", "bitched", "bitches", "bitching", "bitter", "bitterly", "bitterness",
"punda", "pundai", "thevidiya", "thevidiyal", "thevdiya", "thevdiya paiyan",
  "soothu", "soodu", "saniyan", "sani", "sani paya", "sani magan",
  "sani kudhi", "sani kudiyan", "sani machan", "sani ponnu",
  "sani moodi", "sani kudumbam", "sani sangi", "sootha", "soothi", 
  "sora punda", "sani punda", "loosu", "loosa", "loose", "loose paiyan",
  "loose ponnu", "verri", "veriya", "veriyan", "verri paiyan", "verri ponnu",
  "kevalam", "kevala", "kevala paiyan", "kevala ponnu", "kevalaththanam",
  "kusumbu", "kusumbula", "kusumbu paiyan", "kusumbu ponnu",
  "punda paiyan", "pundai payan", "thevidiya payan", "thevidiyal payan",
  "soothu paiyan", "soodu paiyan", "sani payan", "loosu paiyan",
  "loosu ponnu", "veri payan", "verri ponnu", "veri ponnu", 
  "kattai", "kattai paiyan", "kattai ponnu", "aadayae", "aadaya",
  "aadaya paiyan", "aadaya ponnu", "aayiram", "aayiram pundai",
  "soranai", "soranai payan", "soranai ponnu", "pichakaran", "pichaikaran",
  "pichaikaaran", "thimiru", "thimiru pidicha", "thimiru pidicha paiyan",
  "thimiru pidicha ponnu", "thimuru", "thimuru payyan",
  "thimuru ponnu", "poosu", "poosu punda", "poosu pundai",
  "thiruttu", "thiruttu paiyan", "thiruttu ponnu", "thirutu",
  "thirutu paiyan", "thirutu ponnu", "vayadi", "vayadi ponnu",
  "vayadi paiyan", "vayasana pundai", "vayasana punda",
  "vayasana paiyan", "aambala soothu", "aambala soodu", 
  "aambala pundai", "pombala pundai", "pombala punda",
  "pombala loosu", "pombala thimiru", "aambala loosu", 
  "aambala thimiru", "sani punda", "kondai", "kondai soothu",
  "sundikudu", "sundikuda", "sundikuda paiyan", "sundikuda ponnu",
  "appavi", "sombu", "sombu paiyan", "sombu ponnu",
  "mandayan", "mandai", "mandaya", "mandaiyan", "mandai payan",
  "mandai ponnu", "thola", "tholai", "tholla", "tholla paiyan",
  "tholla ponnu", "koothi", "koothan", "koothi payan", "koothi ponnu",
  "paavi", "paavi payan", "paavi ponnu", "othu", "oththu", "oththa",
  "othan", "othai", "otha pundai", "otha punda", "othan paiyan",
  "othan ponnu", "kadupethura", "kadupethura paiyan",
  "kadupethura ponnu", "kaduppu", "kaduppu paiyan", "kaduppu ponnu",
  "sootha payan", "sootha ponnu", "sundakula", "sundakula paiyan",
  "sundakula ponnu", "soodu mandai", "soodu paiyan",
  "soodu ponnu", "kenai", "kenai payan", "kenai ponnu",
  "sangu", "sangu paiyan", "sangu ponnu", "mudhal", "mudhal paiyan",
  "mudhal ponnu", "kenjan", "kenjina paiyan", "kenjina ponnu",
  "mokai", "mokai paiyan", "mokai ponnu", "mokkara paiyan",
  "mokkara ponnu", "kenjan payan", "kenjan ponnu", "panni",
  "panni paiyan", "panni ponnu", "soothu mokkai", "pundai mokkai",
  "kuda", "kudai", "kudai pundai", "sothai", "sothai pundai",
  "sothai paiyan", "sothai ponnu", "thevidiya kutti",
  "thevdiya kutty", "thevidiya kutty", "sani kutty", "punda kutty",
  "soodu kutty", "pundai kutty", "veri kutty", "loose kutty",
  "mandai kutty", "mokai kutty", "sangu kutty", "othu kutty",
  "kenai kutty", "sothai kutty", "thiruttu kutty", "paavi kutty",
  "panni kutty", "sundikuda kutty", "sombu kutty", "kusumbu kutty",
  "tholla kutty", "mokkara kutty", "thimiru kutty", "aadaya kutty",
  "kattai kutty", "mudhal kutty", "vayasana kutty", "sundakula kutty",
  "sundakula pundai", "koothi kutty", "pombala kutty", "aambala kutty",
  "mandayan kutty", "othai kutty", "mudhal kutty", "mokai kutty",
  "kevalam kutty", "vayasana pundai", "kenai kutty", "sani kutty",
  "sani thevidiya", "othu paiyan", "othu ponnu",
  "thevudiya soothu", "sani soothu", "sootha sundi", "sundikuda soothu",
  "koothi soothu", "pundai soothu", "punda sundi", "punda soothu",
  "sothai soothu", "thevidiya sundi", "othu sundi", "othu soothu",
  "kenai soothu", "verri soothu", "loose soothu", "mandai soothu",
  "mokai soothu", "thevidiya loosu", "thevidiya sundi", "loose thevidiya",
  "kusumbu loosu", "kusumbu thevidiya", "sani loosu", "sani sundi",
  "mokkara soothu", "mudhal loosu", "mudhal sundi", "aadaya loosu",
  "aadaya sundi", "sothai loosu", "sothai sundi", "mokai sundi",
  "mokai loosu", "sundikuda loosu", "sundikuda sundi", "vayadi loosu",
  "vayadi sundi", "verri sundi", "verri loosu",
  "sundakula loosu", "sundakula sundi", "kenai loosu", "kenai sundi",
  "othu loosu", "othu sundi", "koothi loosu", "koothi sundi",
  "sani sundi", "sani loosu", "thevidiya mokai", "thevidiya loosu",
  "aadaya mokai", "aadaya loosu"
];

const Comments = ({ postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [commentText, setCommentText] = useState("");
  const [place, setPlace] = useState("");
  const [taggedFriends, setTaggedFriends] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const commentsRef = ref(rtdb, `comments/${postId}`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedComments = [];
      if (data) {
        for (let id in data) {
          loadedComments.push({ id, ...data[id] });
        }
      }
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [postId]);

  const containsBadWords = (text) => {
    const lowered = text.toLowerCase();
    return badWords.some((word) => lowered.includes(word));
  };

  const handleSend = async () => {
    if (commentText.trim() === "") {
      toast.error("Comment cannot be empty!");
      return;
    }

    if (containsBadWords(commentText)) {
      toast.error("Your comment contains inappropriate words and was not sent.");
      setCommentText("");
      return;
    }

    const newComment = {
      userId: currentUser.uid,
      name: currentUser.cName || currentUser.name || currentUser.email,
      profilePicture: currentUser.profilePic || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png",
      desc: commentText.trim(),
      place: place.trim(),
      taggedFriends: taggedFriends.trim(),
      likes: 0,
      likedBy: {},
      createdAt: Date.now(),
    };

    try {
      await push(ref(rtdb, `comments/${postId}`), newComment);
      setCommentText("");
      setPlace("");
      setTaggedFriends("");
      toast.success("Comment posted successfully!");
    } catch (error) {
      toast.error("Failed to post comment. Please try again.");
      console.error(error);
    }
  };

  const handleLike = async (commentId, comment) => {
    const commentRef = ref(rtdb, `comments/${postId}/${commentId}`);
    const isLiked = comment.likedBy && comment.likedBy[currentUser.uid];

    const updatedLikes = isLiked ? comment.likes - 1 : comment.likes + 1;
    const updatedLikedBy = {
      ...comment.likedBy,
      [currentUser.uid]: !isLiked,
    };

    await update(commentRef, {
      likes: updatedLikes,
      likedBy: updatedLikedBy,
    });
  };

  return (
    <div className="comments">
      <div className="write">
        <img
          src={currentUser.profilePic || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"}
          alt="User"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      {comments.map((comment) => (
        <div className="comment" key={comment.id}>
          <img src={comment.profilePicture} alt="Profile" />
          <div className="info">
            <span>{comment.name}</span>
            <p>{comment.desc}</p>
            {comment.place && <p><strong>📍 Place:</strong> {comment.place}</p>}
            {comment.taggedFriends && <p><strong>👥 With:</strong> {comment.taggedFriends}</p>}
          </div>
          <div className="actions">
            <span className="date">{new Date(comment.createdAt).toLocaleString()}</span>
            <div className="like" onClick={() => handleLike(comment.id, comment)}>
              {comment.likedBy && comment.likedBy[currentUser.uid] ? (
                <FavoriteOutlinedIcon style={{ color: "red" }} />
              ) : (
                <FavoriteBorderOutlinedIcon />
              )}
              <span>{comment.likes || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;
