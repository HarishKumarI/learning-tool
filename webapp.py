import sys
import os
from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_restful import Resource, Api
from pprint import pprint, pformat
import shutil
from neo4j import GraphDatabase
import json
import datetime


driver = GraphDatabase.driver("bolt://115.111.97.194:7687", encrypted=False)

# driver = GraphDatabase.driver(
#     "bolt://127.0.0.1:7687", auth=('neo4j', 'password'))
graph = driver.session()


app = Flask(__name__)
api = Api(app)
CORS(app)


file_dir = os.path.dirname(os.path.abspath(__file__))

sys.path.append(os.path.join(file_dir, './blueprints/'))


keywords_folder = "./blueprints/keywordsData/"
referringExpressionFile = './blueprints/lib_new_referring_exp.json'
triggersFile = './blueprints/trigger_assoc.json'
nlgtemplatesFile = './blueprints/nlg_templates.json'
QueDataFile = './QuestionsData.json'
PlFile = './blueprints/library_v3.pl'
csuf_whoosh = './blueprints/csuf_whoosh/'

from InverseIndexWhoosh import InverseIndexWhoosh
from whoosh.index import create_in,open_dir


# from UniversityReasoner import UniversityReasoner


# reasoner = UniversityReasoner(PlFile, rxp_path='./blueprints/models/r-exp-model',
#                               sem_model_path='./blueprints/models/sem-parse-model', graph_info='..')

def reset_whoosh():
    shutil.rmtree(csuf_whoosh)
    inv_indexer = InverseIndexWhoosh(os.path.join(csuf_whoosh), os.path.join(keywords_folder))
    print('Reset Done!')


def process_question(q, context=None):

    print("Q : ", q)
    answers, pred_tuples, response, failed_assoc_prob_list, res_dict, results, node_doc_results, content_graph_nodes, nudge_dict = reasoner.answer_query(
        q)
    # print("FLASK : ", answers)
    # print()
    return answers, pred_tuples, response, failed_assoc_prob_list, res_dict, results, node_doc_results, content_graph_nodes, nudge_dict


# for Questions Upload Component

@app.route('/QuesData', methods=['GET'])
def QuesData():
    try:
        with open(QueDataFile, 'r') as fp:
            QuesData = json.load(fp)
        return jsonify({'data': QuesData, 'msg': 'success'})
    except:
        return jsonify({'data': {}, 'msg': 'Error'})


@app.route('/saveQuesData', methods=['POST'])
def saveQuesData():
    json_data = request.get_json(force=True)

    try:
        if json_data['oldQues'] != '':
            with open('./backup files/QuestionsData' + str(datetime.datetime.now()) + '.json', 'w') as fp:
                json.dump(json_data['oldQues'], fp, indent=4)

        with open(QueDataFile, 'w') as fp:
            json.dump(json_data['newQues'], fp, indent=4)

        return jsonify({'msg': 'Data Saved Successfully',"status": 'success'})
    except:
        return jsonify({'msg': "Error While Writing to file ",'status':'Error'})


# for Keywords Component

@app.route('/modelnodes', methods=['GET'])
def modelnodes():
    query = "MATCH(n:MODEL_NODE:PROD) return n.name"
    res = graph.run(query)
    model_nodes = []
    for row in res:
        model_nodes += row.values()
    # print(model_nodes)
    return jsonify({'model_nodes': model_nodes})


@app.route('/allgraphnodes', methods=['GET'])
def allmodelnodes():
    query = "MATCH(n:DATA_NODE:PROD) return n.name"
    res = graph.run(query)
    model_nodes = []
    for row in res:
        model_nodes += row.values()
    # print(model_nodes)
    return jsonify({'graph_nodes': model_nodes})


@app.route('/graphnodes', methods=['POST'])
def graphnodes():
    json_data = request.get_json(force=True)
    query = "MATCH (Z:PROD {name: '" + \
        json_data['model_node'] + "'})<-[r1:is_a]-(m) return m.name"
    result = graph.run(query)
    graph_nodes = []
    for row in result:
        graph_nodes += row.values()
    # print(graph_nodes,query)

    return jsonify({'key_nodes': graph_nodes})


@app.route('/keywords', methods=['POST'])
def keywords():

    json_data = request.get_json(force=True)
    keywords = ""
    if (os.path.exists(os.path.join(keywords_folder, json_data['graph_node']+'.txt'))):
        with open(os.path.join(keywords_folder, json_data['graph_node']+'.txt'), 'r') as fp:
            keywords = fp.read()
            keywords = keywords.split('\n')
    else:
        f = open(os.path.join(keywords_folder,
                              json_data['graph_node']+'.txt'), 'w')
        f.write("")
        f.close()
    return jsonify({'keywords': keywords})


@app.route('/saveKeywords', methods=['POST'])
def saveKeynodes():
    json_data = request.get_json(force=True)
    keywordFileName = json_data['filename']
    keywordsarr = json_data['keywords']
    
    try:
        f = open(os.path.join(keywords_folder, keywordFileName)+'.txt', 'w')
        f.write(' \n'.join(keywordsarr))
        f.close()

        reset_whoosh()

        return jsonify({'msg': 'Data Saved Successfully',"status": 'success'})
    except:
        return jsonify({'msg': "Error While Writing to file ",'status':'Error'})

# for ReferringExpression Component


@app.route('/referringExp', methods=['POST'])
def referringExp():
    json_data = request.get_json(force=True)
    modelnode = json_data['model_node']

    with open(referringExpressionFile, 'r') as fp:
        refexpData = json.load(fp)

    return jsonify({'model_ref_exp': refexpData[modelnode]['model'], 'graph_ref_exp': refexpData[modelnode]['graph']})


@app.route('/saveRefExp', methods=['POST'])
def saveRefExp():
    json_data = request.get_json(force=True)
    modelnode = json_data['model_node']
    modelData = json_data['model_ref_exp']
    graphData = json_data['graph_ref_exp']

    try:
        with open(referringExpressionFile, 'r') as fp:
            refexpData = json.load(fp)

        refexpData[modelnode] = {'model': modelData, 'graph': graphData}

        with open(referringExpressionFile, 'w') as fp:
            json.dump(refexpData, fp, indent=4)

        return jsonify({'msg': 'Data Saved Successfully',"status": 'success'})
    except:
        return jsonify({'msg': "Error While Writing to file ",'status':'Error'})

# for triggers


@app.route('/triggersData', methods=['GET'])
def triggersData():

    with open(triggersFile, 'r') as fp:
        triggerData = json.load(fp)

    return triggerData

@app.route('/savetriggers',methods=['POST'])
def savetriggers():
    json_data = request.get_json(force=True)
    triggersData = json_data['triggers_data']
    
    try:
        with open(triggersFile, 'w') as fp:
            json.dump(triggersData, fp,indent=4)

        return jsonify({'msg': 'Data Saved Successfully',"status": 'success'})
    except:
        return jsonify({'msg': "Error While Writing to file ",'status':'Error'})

# for Nlg Data
@app.route('/NlgData', methods=['GET'])
def NlgData():

    with open(nlgtemplatesFile, 'r') as fp:
        nlgData = json.load(fp)

    return nlgData

@app.route('/savenlgdata',methods=['POST'])
def savenlgdata():
    json_data = request.get_json(force=True)
    nlgdata = json_data['nlg_data']
    
    try:
        with open(nlgtemplatesFile, 'w') as fp:
            json.dump(nlgdata, fp,indent=4)

        return jsonify({'msg': 'Data Saved Successfully',"status": 'success'})
    except:
        return jsonify({'msg': "Error While Writing to file ",'status':'Error'})



# for Graph Tool

@app.route('/relations',methods=['GET'])
def relations():
    
    query = "MATCH (n)-[relation]->(m) RETURN relation"
    res = graph.run(query)

    relations = []
    for row in res:
        relations.append(row["relation"].type)
        
    relations = list(set(relations))   

    return jsonify({'relations': relations})


@app.route('/createnode', methods=['POST'])
def createnode():
    json_data = request.get_json(force=True)
    modelnode = str(json_data['modelnode'])
    nodeid = str(json_data['nodeid'])
    nodename = str(json_data['nodename'])
    desc = str(json_data['desc'])
    parentnode = str(json_data['parentnode'])
    relation = str(json_data['relation'])
    
    
    try:
        create_node_query = "CREATE (n:DATA_NODE:PROD { name: '%s', node_name: '%s', node_description: '%s'})" % (
            nodeid, nodename, desc)
        graph.run(create_node_query)

        # pred = 'is_a'
        
        try:
            create_rel_query = "MERGE (a:DATA_NODE:PROD {name: '%s'}) \
                        MERGE (b:MODEL_NODE:PROD {name: '%s'}) \
                        MERGE (a)-[:is_a {name: 'is_a'}]->(b)" % (nodeid, modelnode)
            graph.run(create_rel_query)

            create_rel_query = "MERGE (a:DATA_NODE:PROD {name: '%s'}) \
                                MERGE (b:DATA_NODE:PROD {name: '%s'}) \
                                MERGE (a)-[:%s {name: '%s'}]->(b)"%(nodeid, parentnode, relation, relation)
        
            graph.run(create_rel_query)
            
            try:
                with open(PlFile, 'a+') as f:
                    f.write("\nname(%s, '%s'). \ndescription(%s,'%s'). \nis_a(%s, %s).\n" % ( nodeid, nodename, nodeid, desc, nodeid, modelnode))

                return jsonify({'msg': 'Node Created Successfully','status': 'success'})
            except:
                return jsonify({'msg': 'Error While Writing to Pl File','status': 'Warning'})

        except:
            return jsonify({'msg': 'Error Creating Relation','status': 'Error'})

    except:
        return jsonify({'msg': 'Error Creating Node','status': 'Error'})


class QAssistant(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        question = json_data['question']

        answers, pred_tuples, response, failed_assoc_prob_list, res_dict, results, node_doc_results, content_graph_nodes, nudge_dict = process_question(
            question)

        return {"current_q": question, "answer_json": {"answer": answers,
													   "pred_tuples": pred_tuples,
													   "response": response,
													   "failed_assoc_prob_list": str(failed_assoc_prob_list),
													   "res_dict": pformat(res_dict),
													   "results": results[:1],
													   "node_doc_results": node_doc_results,
                                                       "ref_exp_nodes": ref_exp_nodes,
													   "nudge_dict": nudge_dict
		}}

        # print("node_doc_results : ", node_doc_results)
        # return {"current_q": question, "answer_json": {
        #     "answer": ["<X.name> is located at Digital Print Services, second floor, Pollak Library North (PLN-220).", "<X.name> is located at Digital Print Services, second floor, Pollak Library North (PLN-220).", "<X.name> is located at 4th Floor, Pollak Library North."],
        #     "failed_assoc_prob_list": [],
        #     "pred_tuples": [['located_at', 'color_print', 'X'], ['located_at', 'color_print', 'Y'], ['located_at', 'infra', 'Z']],
        #     "res_dict": "{'trigger_info': [{'predicates': {6: defaultdict(<class 'list'>,\n                                                 {'color print': [(('located_at',\n                                                                    1.0),\n                                                                   ([('print_type',\n                                                                      0.999821),\n                                                                     ('printing',\n                                                                      3.8507173e-07),\n                                                                     ('special_print',\n                                                                      1.4818667e-07)],\n                                                                    'color '\n                                                                    'print'),\n                                                                   ([(False,\n                                        …",
        #     "response": [[[['located_at', 'color_print', 'Digital Print Services, second floor, Pollak Library North (PLN-220)']]], [[['located_at', 'color_print', 'Digital Print Services, second floor, Pollak Library North (PLN-220)']]], [[['located_at', 'infra', '4th Floor, Pollak Library North']]]],
        #     "results": [['located_at(print_type,?)', {'p': 'located_at', 'x': 'color print', 'y': 'where', 'neg': '\\\\b(?:where)\\\\b'}], ['located_at(print_type,?)', {'p': 'located_at', 'x': 'color print', 'y': 'i', 'neg': '\\\\b(?:where)\\\\b'}], ['located_at(infra,?)', {'p': 'located_at', 'x': 'i', 'y': 'where', 'neg': '\\\\b(?:where)\\\\b'}]],
        #     "node_doc_results": str('node_doc_results'),
        #     "nudge_dict": {}
        # }}       


api.add_resource(QAssistant, '/')

if __name__ == '__main__':
    app.run("0.0.0.0", debug=False, port=7209, threaded=False, processes=1)
