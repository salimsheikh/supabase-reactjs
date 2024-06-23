import React, {useEffect, useState, useRef} from 'react'
import { supabase } from './lib/helper/supabase_client'

export default function App() {

  //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

    const login = async () => {

      try {
        const { data, error } =await supabase.auth.signInWithOAuth({
          provider: "github",
        });

       
        if (error) {
          console.error('Error signing in:', error.message);
        } else {
          console.log('User signed in:', data);
        }

      } catch (error) {
        console.error('Error during sign in:', error);
      }

    }

    useEffect(() => {
      async function fetchSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
        } else {
          setSession(session);
          setUser(session?.user);

          const {data: authListioner} = supabase.auth.onAuthStateChange(
            (event, session) => {
              switch(event){
                case "SIGNED_IN":                
                  setUser(session?.user);
                  break;
                case "SIGNED_OUT":
                  setUser(null);
                    break;
                default:
                    break;
              }
            }
          );

          return () => {
            authListioner.unsubscribe();
          }
        }
      }  
      fetchSession();
    }, []);

    const logout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error during sign up:', error);
      }
    }

    const inputRef = useRef();
    const {error, setError} = useState(null);

    const handleCreateTody = async () => {
      const title = inputRef.current.value;
        const response = await supabase.from('todo').insert({title:title, user_id: user.id}).select("*").single();
        console.log(response);
    }

    return (
      <div>
        <div>
          <h1>React Supabase database CRUD and policy</h1>
          <div>
              <input ref={inputRef} />
              <button onClick={handleCreateTody} > add</button>

              {error && <pre>error.message</pre>}

          </div>
        </div>      
      </div>
    )  
  }
