var db = require('org/arangodb').db;

exports.getJoinedActivities = function(userId, future, past)
{
    var filter = "";
    if(future && !past)
    {
        filter = "filter document(start._to).value >= date_now()";
    }
    else if(!future && past)
    {
        filter = "filter document(start._to).value < date_now()";
    }
    else
    {
        filter = "";
    }

    return db._query("return unique((for joined in graph_edges('fiplus', @userId, {edgeCollectionRestriction:'joined'})" +
                "for suggested in graph_edges('fiplus', joined._to, {edgeCollectionRestriction:'suggested'})" +
                "for is in graph_edges('fiplus', suggested._to, {edgeCollectionRestriction:'is', endVertexCollectionRestriction:'time_period'})" +
                "for start in graph_edges('fiplus', is._to, {edgeCollectionRestriction:'start'})" +
                filter +
                "return document(joined._to)))", {userId:userId}).toArray()[0];
};