import React, {useEffect, useState} from "react";
import PostItem from "./PostItem.jsx";
import PostFilterSelect from "./PostFilterSelect.jsx";
import PostService from "../../services/PostService";
import SectionService from "../../services/SectionService";

const Home = (props) => {
    const [items, setItems] = useState([]);
    const [selectedSort, setSelectedSort] = useState('')
    const [sections, setSections] = useState([])
    const [selectedSection, setSelectedSection] = useState('')

    useEffect(() => {
        PostService.getFeed().then(
            response => {
                setItems(response.data);
            }
        )
        SectionService.getSections().then(
            response => {
                setSections(response.data.sections)
            }
        )
    }, [])

    const sortPosts = (sortValue) => {
        setItems([...items].sort((a, b) => {
            if (sortValue === 'created_at')
                return b.created_at.localeCompare(a.created_at)
            else
                return a[sortValue].localeCompare(b[sortValue])
        }))
        setSelectedSort(sortValue)
    }

    const filterSections = (filter) => setSelectedSection(filter.target.textContent)

    return (
        <div className="container">
            <div className="d-flex justify-content-center fit-width p-lg-0">
                {
                    sections.map((section) =>
                        <p key={section} className={'section ' + (section === selectedSection ? 'enabled' : '')}
                           onClick={filterSections}>{section}</p>
                    )
                }
            </div>
            <div className="container d-flex justify-content-end">
                <PostFilterSelect
                    value={selectedSort}
                    onChange={sortPosts}
                    defaultValue='Sort by'
                    options={[
                        {value: 'title', name: 'By title'},
                        {value: 'created_at', name: 'Most recent'},
                    ]}
                />
            </div>
            {/* We don't want to filter posts by default */}
            {items.map((post) =>
                (selectedSection === '' || post.section === selectedSection) && <PostItem key={post.id} post={post}/>
            )
            }
        </div>
    );
}

export default Home